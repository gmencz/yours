import * as Linking from "expo-linking";
import { useEffect } from "react";
import { supabase } from "modules/supabase/client";

export const useSessionListener = () => {
  const extractSessionFromLink = async (link: string) => {
    const parsedURL = Linking.parse(link.replace("#", "?")!);

    if (
      parsedURL.queryParams?.access_token &&
      parsedURL.queryParams.refresh_token
    ) {
      supabase.auth.setSession({
        access_token: parsedURL.queryParams.access_token as string,
        refresh_token: parsedURL.queryParams.refresh_token as string,
      });
    } else if (parsedURL.queryParams?.error_code) {
      // TODO: Handle error
      console.log(
        `Error extracting session from link: ${parsedURL.queryParams.error_code}`
      );
    }
  };

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
  }, []);
};
