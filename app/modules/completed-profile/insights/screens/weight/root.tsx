import { Skeleton, Text, useTheme } from "@rneui/themed";
import { useProfileQuery } from "modules/auth/hooks/use-profile-query";
import { Heading1, Heading2 } from "modules/common/components/headings";
import { ScrollView, View } from "react-native";
import { useState } from "react";
import { useWeightsQuery } from "../../hooks/use-weights-query";
import { WeightsGraph } from "../../components/weights-graph";

export type Period = "1W" | "1M" | "3M" | "6M" | "1Y";

export function WeightScreen() {
  const { theme } = useTheme();
  const { data: profile } = useProfileQuery();
  const [period, setPeriod] = useState<Period>("1W");

  const {
    data: weights,
    isLoading,
    isError,
  } = useWeightsQuery({
    period,
    profileId: profile!.id,
  });

  return (
    <ScrollView
      style={{
        backgroundColor: theme.colors.background,
        paddingVertical: theme.spacing.xl,
      }}
    >
      <View style={{ paddingHorizontal: theme.spacing.xl }}>
        <Heading1>Weight Trend & Scale Weight</Heading1>
        <Heading2 style={{ marginTop: theme.spacing.sm }}>
          Data based on daily weigh-ins over time.
        </Heading2>
      </View>

      <View style={{ marginTop: theme.spacing.lg }}>
        {isLoading ? (
          <View style={{ paddingHorizontal: theme.spacing.xl }}>
            <Skeleton height={42.5} />
            <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
            <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
            <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
            <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
            <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
            <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
          </View>
        ) : isError ? (
          <Text
            style={{
              color: theme.colors.error,
              paddingHorizontal: theme.spacing.xl,
            }}
          >
            Something went wrong calculating your weight trend.
          </Text>
        ) : (
          <WeightsGraph
            weights={weights}
            period={period}
            setPeriod={setPeriod}
          />
        )}
      </View>
    </ScrollView>
  );
}
