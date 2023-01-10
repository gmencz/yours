import { makeStyles, Skeleton, Text, useTheme } from "@rneui/themed";
import { ScrollView, View } from "react-native";
import { ExpenditureData } from "~/components/EnergyExpenditureData";
import { Heading } from "~/components/Heading";
import { useProfileQuery } from "~/hooks/useProfileQuery";
import { useTdeeEstimationsQuery } from "~/hooks/useTdeeEstimatonsQuery";

export function EnergyExpenditureScreen() {
  const { theme } = useTheme();
  const { data: profile } = useProfileQuery();

  const {
    data: estimations,
    isLoading,
    isError,
  } = useTdeeEstimationsQuery({
    profileId: profile!.id,
  });

  const styles = useStyles();

  return (
    <ScrollView style={styles.scrollView}>
      <Heading type="h1">Energy Expenditure</Heading>
      <Heading type="h2" style={styles.h2}>
        The brighter the yellow is, the greater confidence we have in our
        estimate of your daily energy expenditure. Updates weekly.
      </Heading>

      <View style={styles.skeletonsContainer}>
        {isLoading ? (
          <>
            <Skeleton height={20} style={styles.skeletons2} />
            <Skeleton height={40} style={styles.skeletons1} />
            <Skeleton height={40} style={styles.skeletons2} />
            <Skeleton height={40} style={styles.skeletons2} />
            <Skeleton height={40} style={styles.skeletons2} />
            <Skeleton height={40} style={styles.skeletons2} />
          </>
        ) : isError ? (
          <Text style={{ color: theme.colors.error }}>
            Something went wrong calculating your expenditure.
          </Text>
        ) : (
          <ExpenditureData estimations={estimations} />
        )}
      </View>
    </ScrollView>
  );
}

const useStyles = makeStyles((theme) => ({
  scrollView: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },

  skeletonsContainer: {
    marginTop: theme.spacing.lg,
  },

  skeletons1: {
    marginTop: theme.spacing.xl,
  },

  skeletons2: {
    marginTop: theme.spacing.lg,
  },

  h2: {
    marginTop: theme.spacing.sm,
  },
}));
