import { makeStyles, Skeleton, Text } from "@rneui/themed";
import { ScrollView, View } from "react-native";
import { useState } from "react";
import { useProfileQuery } from "~/hooks/useProfileQuery";
import { Heading } from "~/components/Heading";
import { useWeightsQuery } from "~/hooks/useWeightsQuery";
import { WeightsGraph } from "~/components/WeightsGraph";

export type Period = "1W" | "1M" | "3M" | "6M" | "1Y";

export function WeightScreen() {
  const { data: profile } = useProfileQuery();
  const [period, setPeriod] = useState<Period>("1W");
  const styles = useStyles();

  const {
    data: weights,
    isLoading,
    isError,
  } = useWeightsQuery({
    period,
    profileId: profile!.id,
  });

  const showGraph = weights?.length && weights.length > 1;

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.headingsContainer}>
        <Heading type="h1">Weight</Heading>
        {isLoading ? (
          <Skeleton height={20} style={styles.h2Skeleton} />
        ) : (
          <Heading type="h2" style={styles.h2}>
            {showGraph
              ? "Graph based on weigh-ins over time."
              : "There aren't enough weigh-ins to show you accurate insights about your weight yet."}
          </Heading>
        )}
      </View>

      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.skeletonsContainer}>
            <Skeleton height={42.5} />
            <Skeleton height={42.5} style={styles.skeleton} />
            <Skeleton height={42.5} style={styles.skeleton} />
            <Skeleton height={42.5} style={styles.skeleton} />
            <Skeleton height={42.5} style={styles.skeleton} />
            <Skeleton height={42.5} style={styles.skeleton} />
            <Skeleton height={42.5} style={styles.skeleton} />
          </View>
        ) : isError ? (
          <Text style={styles.error}>
            Something went wrong calculating your weight trend.
          </Text>
        ) : showGraph ? (
          <WeightsGraph
            weights={weights}
            period={period}
            setPeriod={setPeriod}
          />
        ) : null}
      </View>
    </ScrollView>
  );
}

const useStyles = makeStyles((theme) => ({
  scrollView: {
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.xl,
  },

  error: {
    color: theme.colors.error,
    paddingHorizontal: theme.spacing.xl,
  },

  skeleton: {
    marginTop: theme.spacing.lg,
  },

  skeletonsContainer: {
    paddingHorizontal: theme.spacing.xl,
  },

  container: {
    marginTop: theme.spacing.lg,
  },

  headingsContainer: {
    paddingHorizontal: theme.spacing.xl,
  },

  h2: {
    marginTop: theme.spacing.sm,
  },

  h2Skeleton: {
    marginTop: theme.spacing.lg,
  },
}));
