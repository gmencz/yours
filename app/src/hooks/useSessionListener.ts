import { useCallback, useEffect } from "react";
import * as Linking from "expo-linking";
import Toast from "react-native-toast-message";
import * as Sentry from "sentry-expo";
import { supabase } from "~/supabase";
import { useQueryClient } from "@tanstack/react-query";

export function useSessionListener() {
  const queryClient = useQueryClient();

  const extractSessionFromLink = useCallback(
    async (link: string) => {
      const parsedURL = Linking.parse(link.replace("#", "?")!);

      if (
        parsedURL.queryParams?.access_token &&
        parsedURL.queryParams.refresh_token
      ) {
        const { data, error } = await supabase.auth.setSession({
          access_token: parsedURL.queryParams.access_token as string,
          refresh_token: parsedURL.queryParams.refresh_token as string,
        });

        queryClient.setQueryData(["session"], data.session);

        if (error) {
          Toast.show({
            type: "error",
            text2: "Oops! Something went wrong authenticating you.",
          });

          Sentry.Native.captureException(
            new Error("Error setting session from query params"),
            {
              extra: {
                error_code: parsedURL.queryParams.error_code,
                access_token: parsedURL.queryParams.access_token,
                refresh_token: parsedURL.queryParams.refresh_token,
              },
            }
          );
        }
      } else if (parsedURL.queryParams?.error_code) {
        Toast.show({
          type: "error",
          text2: "Oops! Something went wrong authenticating you.",
        });

        Sentry.Native.captureException(
          new Error("Error extracting session from link"),
          { extra: { error_code: parsedURL.queryParams.error_code } }
        );
      }
    },
    [queryClient]
  );

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) {
        extractSessionFromLink(url!);
      }
    });

    function handler(res: { url: string }) {
      if (res.url) {
        extractSessionFromLink(res.url);
      }
    }

    const listener = Linking.addEventListener("url", handler);

    return () => {
      listener.remove();
    };
  }, [extractSessionFromLink]);
}
