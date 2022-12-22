import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, useTheme } from "@rneui/themed";
import { useQuery } from "@tanstack/react-query";
import { useProfileQuery } from "modules/auth/hooks/use-profile-query";
import { Heading1, Heading2 } from "modules/common/components/headings";
import { CompletedProfileStackParamList } from "modules/common/types";
import { supabase } from "modules/supabase/client";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = NativeStackScreenProps<CompletedProfileStackParamList, "Strategy">;

interface EstimationQueryData {
  estimation: number;
}

interface GoalQueryData {
  goal: "build-muscle" | "lose-fat" | "maintain";
  weekly_weight_change: number;
  approach: "bulk" | "cut" | "maintain";
}

function calculateDailyCalorieChange(
  baseCalories: number,
  weightUnit: "lbs" | "kgs",
  desiredWeightGain: number
) {
  // Calculate the number of calories needed to gain 1 pound or 1 kilogram
  const caloriesPerPound = 3500;
  const caloriesPerKilogram = 7700;

  // Calculate the total number of calories needed to gain the desired weight
  let caloriesToGain: number;
  if (weightUnit === "lbs") {
    caloriesToGain = desiredWeightGain * caloriesPerPound;
  } else {
    caloriesToGain = desiredWeightGain * caloriesPerKilogram;
  }

  // Calculate the total number of daily calories needed to achieve the desired weight gain in a week
  const dailyCalorieIncrease = caloriesToGain / 7;
  return dailyCalorieIncrease;
}

export function StrategyScreen({}: Props) {
  const { theme } = useTheme();
  const { data: profile } = useProfileQuery();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["nutritionForStrategy"],
    queryFn: async () => {
      // Get the most recent TDEE estimation
      const { data: latestTdeeEstimations, error: latestTdeeEstimationError } =
        await supabase
          .from("profiles_tdee_estimations")
          .select<string, EstimationQueryData>("estimation")
          .eq("profile_id", profile!.id)
          .limit(1)
          .order("created_at", { ascending: false });

      if (latestTdeeEstimationError) {
        throw latestTdeeEstimationError;
      }

      let estimation: number;
      const latestTdeeEstimation = latestTdeeEstimations[0];
      if (latestTdeeEstimation) {
        estimation = latestTdeeEstimation.estimation;
      } else {
        estimation = profile!.initial_tdee_estimation!;
      }

      // Get the user's goal
      const { data: goal, error: goalError } = await supabase
        .from("profiles_goals")
        .select<string, GoalQueryData>("goal, weekly_weight_change, approach")
        .eq("id", profile!.goal_id)
        .single();

      if (goalError) {
        throw goalError;
      }

      const caloriesToChange = calculateDailyCalorieChange(
        estimation,
        profile?.prefered_measurement_system === "imperial" ? "lbs" : "kgs",
        goal.weekly_weight_change
      );

      const calories = Math.round(estimation + caloriesToChange);
      return { calories, goal };
    },
  });

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.xl,
      }}
    >
      <Heading1>Strategy</Heading1>
      <Heading2>
        This is the strategy we recommend for you based on your goal.
      </Heading2>

      {/* TODO: Make the design for this way better */}
      {data ? (
        <View style={{ marginTop: theme.spacing.lg }}>
          <Text>Daily calories: {data.calories}</Text>
          <Text>
            Approach:{" "}
            {data.goal.approach === "bulk"
              ? "Bulk (caloric surplus)"
              : data.goal.approach === "cut"
              ? "Cut (caloric deficit)"
              : "Maintain (caloric maintenance)"}
          </Text>
          <Text>
            Weekly weight change goal: {data.goal.weekly_weight_change}{" "}
            {profile?.prefered_measurement_system === "imperial"
              ? "lbs"
              : "kgs"}
          </Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
