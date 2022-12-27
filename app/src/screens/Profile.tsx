import { makeStyles, Text } from "@rneui/themed";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Sentry from "sentry-expo";
import { Button } from "~/components/Button";
import { useProfileQuery } from "~/hooks/useProfileQuery";
import { supabase } from "~/supabase";

export function ProfileScreen() {
  const { data: profile } = useProfileQuery();
  const styles = useStyles();

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
    <SafeAreaView style={styles.safeAreaView}>
      <Text style={styles.sectionTitle}>Prefered measurement system</Text>
      <Text style={styles.sectionData}>
        {profile?.preferedMeasurementSystem === "imperial"
          ? "Imperial (lbs, ft)"
          : "Metric (kgs, cms)"}
      </Text>

      <Button
        title="Sign out"
        variant="2"
        style={styles.signOutButton}
        onPress={signOut}
      />
    </SafeAreaView>
  );
}

const useStyles = makeStyles((theme) => ({
  safeAreaView: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },

  sectionTitle: {
    fontWeight: "bold",
  },

  sectionData: {
    color: theme.colors.grey1,
  },

  signOutButton: {
    marginTop: theme.spacing.xl,
  },
}));
