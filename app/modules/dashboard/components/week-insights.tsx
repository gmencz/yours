import { Skeleton, Text, useTheme } from "@rneui/themed";
import { useQuery } from "@tanstack/react-query";
import { subDays } from "date-fns";
import { useProfileQuery } from "modules/auth/hooks/use-profile-query";
import { supabase } from "modules/supabase/client";
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

  const totalCalories = weekCaloriesAndWeights
    .filter(({ calories }) => !!calories)
    .reduce((total, next) => total + (next.calories as number), 0);

  const { data: profile } = useProfileQuery();

  useQuery({
    queryKey: ["weekExpenditure", startOfWeekDateString],
    queryFn: async () => {
      // Fetch previous week and get avg weight.
      const startOfLastWeekDateString = subDays(
        new Date(startOfWeekDateString),
        6
      ).toISOString();

      const { data, error } = await supabase
        .from("profiles_calories_and_weights")
        .select<
          string,
          {
            calories: number;
            weight: number;
          }
        >("id, created_at, calories, weight")
        .gte("created_at", startOfLastWeekDateString)
        .lt("created_at", startOfWeekDateString)
        .eq("profile_id", profile!.id)
        .limit(7)
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      const currentTdee = profile!.tdee!;
      const caloriesNeededToGain1kg = 7000;
      const previousWeekWeights = data.filter(({ weight }) => !!weight);
      const previousWeekWeight =
        previousWeekWeights.reduce(
          (total, next) => total + (next.weight as number),
          0
        ) / previousWeekWeights.length;

      const weightFluctuation = weight - previousWeekWeight;
      const extraCaloriesConsumed = caloriesNeededToGain1kg * weightFluctuation;
      // const caloriesNeededForMaintance = totalCalories - extraCaloriesConsumed;

      console.log({ extraCaloriesConsumed, totalCalories });

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
