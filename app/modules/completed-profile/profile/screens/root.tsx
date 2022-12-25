import { Text, useTheme } from "@rneui/themed";
import { useProfileQuery } from "modules/auth/hooks/use-profile-query";
import { Button } from "modules/common/components/button";
import { supabase } from "modules/supabase/client";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import * as Sentry from "sentry-expo";

export function ProfileScreen() {
  const { theme } = useTheme();
  const { data: profile } = useProfileQuery();

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Sentry.Native.captureException(error);
      Toast.show({
        type: "error",
        text2: "Oops! Something went wrong signing you out.",
      });
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.xl,
      }}
    >
      <Text style={{ fontWeight: "bold" }}>Prefered measurement system</Text>
      <Text style={{ color: theme.colors.grey1 }}>
        {profile?.prefered_measurement_system === "imperial"
          ? "Imperial (lbs, ft)"
          : "Metric (kgs, cms)"}
      </Text>

      <Button
        title="Sign out"
        variant="2"
        style={{ marginTop: theme.spacing.xl }}
        onPress={signOut}
      />
    </SafeAreaView>
  );
}
