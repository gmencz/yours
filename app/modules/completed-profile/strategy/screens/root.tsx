import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Icon, Skeleton, Text, useTheme } from "@rneui/themed";
import { useQuery } from "@tanstack/react-query";
import { useProfileQuery } from "modules/auth/hooks/use-profile-query";
import { Button } from "modules/common/components/button";
import { Heading1, Heading2 } from "modules/common/components/headings";
import { CompletedProfileStackParamList } from "modules/common/types";
import { themeColor3 } from "modules/common/utils/colors";
import { supabase } from "modules/supabase/client";
import { Dimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = NativeStackScreenProps<CompletedProfileStackParamList, "Strategy">;

interface EstimationQueryData {
  estimation: number;
  weight: number;
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
          .select<string, EstimationQueryData>("estimation, weight")
          .eq("profile_id", profile!.id)
          .limit(1)
          .order("created_at", { ascending: false });

      if (latestTdeeEstimationError) {
        throw latestTdeeEstimationError;
      }

      let estimation: number;
      let weight: number;
      const latestTdeeEstimation = latestTdeeEstimations[0];
      if (latestTdeeEstimation) {
        estimation = latestTdeeEstimation.estimation;
        weight = latestTdeeEstimation.weight;
      } else {
        estimation = profile!.initial_tdee_estimation!;
        weight = profile!.initial_weight!;
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

      const recommendedDailyCalories = Math.round(
        estimation + caloriesToChange
      );

      const proteinMultiplier =
        profile?.prefered_measurement_system === "imperial" ? 1 : 2.2;
      const recommendedProteinIntake = Math.round(weight * proteinMultiplier);

      return { recommendedDailyCalories, recommendedProteinIntake, goal };
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
      <Heading2 style={{ marginBottom: theme.spacing.lg }}>
        We have set up some targets for you to hit based on your goal which will
        help you reach it with optimal muscle growth.
      </Heading2>

      {isLoading ? (
        <>
          <Skeleton height={42.5} />
          <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
          <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
          <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
          <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
          <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
          <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
        </>
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
        <View>
          <Button
            title="Edit goal"
            variant="2"
            style={{
              paddingLeft: theme.spacing.lg,
              paddingRight: theme.spacing.xl,
              alignSelf: "flex-start",
              marginBottom: theme.spacing.xl,
            }}
            icon={
              <Icon
                type="material"
                name="edit"
                size={20}
                style={{ marginRight: theme.spacing.md }}
              />
            }
            small
            onPress={() => {
              // TODO
            }}
          />

          <StrategyTarget
            amount={data.recommendedDailyCalories}
            unit="kcal"
            color={theme.colors.primary}
            name="Daily calorie intake"
            icon={
              <Icon
                type="material-community"
                name="fire"
                size={40}
                color={theme.colors.black}
              />
            }
          />

          <View style={{ marginTop: theme.spacing.xl }}>
            <StrategyTarget
              amount={data.recommendedProteinIntake}
              unit="g"
              color={theme.colors.secondary}
              name="Daily protein intake"
              icon={
                <Icon
                  type="material-community"
                  name="arm-flex"
                  size={40}
                  color={theme.colors.black}
                />
              }
            />
          </View>

          <View style={{ marginTop: theme.spacing.xl }}>
            <StrategyTarget
              amount={8}
              unit="hours"
              color={themeColor3}
              name="Daily sleep"
              icon={
                <Icon
                  type="material-community"
                  name="sleep"
                  size={40}
                  color={theme.colors.black}
                />
              }
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

interface StrategyTargetProps {
  color: string;
  amount: number;
  unit: string;
  name: string;
  icon: JSX.Element;
}

function StrategyTarget({
  color,
  amount,
  unit,
  name,
  icon,
}: StrategyTargetProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: color,
        padding: theme.spacing.xl,
        borderRadius: 15,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            marginBottom: theme.spacing.sm,
          }}
        >
          <Text style={{ fontFamily: "InterBold", fontSize: 16 }}>
            {amount}{" "}
          </Text>
          <Text style={{ color: theme.colors.grey1 }}>{unit}</Text>
        </View>
        <Text style={{ color: theme.colors.grey0 }}>{name}</Text>
      </View>

      <View
        style={{
          marginLeft: "auto",
          padding: theme.spacing.lg,
          borderRadius: 15,
          backgroundColor: color,
        }}
      >
        {icon}
      </View>
    </View>
  );
}
