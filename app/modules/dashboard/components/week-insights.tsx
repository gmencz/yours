import { Skeleton, Text, useTheme } from "@rneui/themed";
import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { WeekDayCaloriesAndWeightData } from "../hooks/use-week-calories-and-weights-query";

type WeekInsightsProps = {
  weekCaloriesAndWeights?: WeekDayCaloriesAndWeightData[];
  isLoading: boolean;
  startOfWeekDateString: string;
};

export function WeekInsights({
  weekCaloriesAndWeights,
  isLoading,
  startOfWeekDateString,
}: WeekInsightsProps) {
  const { theme } = useTheme();

  return (
    <View style={{ marginTop: 40, paddingBottom: 60 }}>
      <Text
        style={{
          fontFamily: "InterSemiBold",
          fontSize: 16,
          marginBottom: theme.spacing.md,
        }}
      >
        Insights
      </Text>

      {isLoading ? (
        <WeekInsightsSkeleton />
      ) : weekCaloriesAndWeights ? (
        <WeekInsightsData
          startOfWeekDateString={startOfWeekDateString}
          weekCaloriesAndWeights={weekCaloriesAndWeights}
        />
      ) : null}
    </View>
  );
}

function WeekInsightsSkeleton() {
  const { theme } = useTheme();

  return (
    <View style={{ flexDirection: "row" }}>
      <Skeleton
        style={{
          backgroundColor: theme.colors.grey5,
          marginRight: theme.spacing.lg,
          borderRadius: 5,
          flex: 1,
        }}
        height={70}
      />
      <Skeleton
        style={{
          backgroundColor: theme.colors.grey5,
          borderRadius: 5,
          flex: 1,
        }}
        height={70}
      />
    </View>
  );
}

type WeekInsightsDataProps = {
  weekCaloriesAndWeights: WeekDayCaloriesAndWeightData[];
  startOfWeekDateString: string;
};

function WeekInsightsData({
  weekCaloriesAndWeights,
  startOfWeekDateString,
}: WeekInsightsDataProps) {
  const { theme } = useTheme();
  const weights = weekCaloriesAndWeights.filter(({ weight }) => !!weight);
  const weight =
    weights.reduce((total, next) => total + (next.weight as number), 0) /
    weights.length;

  console.log({ weight });

  useQuery({
    queryKey: ["weekExpenditure", startOfWeekDateString],
    queryFn: () => {
      // TODO
      return null;
    },
  });

  return (
    <View style={{ flexDirection: "row" }}>
      <View
        style={{
          backgroundColor: theme.colors.grey5,
          flex: 1,
          marginRight: theme.spacing.lg,
          borderRadius: 5,
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.lg,
        }}
      >
        <Text>Expenditure</Text>
      </View>

      <View
        style={{
          backgroundColor: theme.colors.grey5,
          flex: 1,
          borderRadius: 5,
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.lg,
        }}
      >
        <Text>Weight Trend</Text>
      </View>
    </View>
  );
}
