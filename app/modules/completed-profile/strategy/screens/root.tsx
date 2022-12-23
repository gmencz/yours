import { yupResolver } from "@hookform/resolvers/yup";
import { Picker } from "@react-native-picker/picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Icon, Skeleton, Text, useTheme } from "@rneui/themed";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Profile, useProfileQuery } from "modules/auth/hooks/use-profile-query";
import { Button } from "modules/common/components/button";
import { ControlledInput } from "modules/common/components/controlled-input";
import { ControlledPicker } from "modules/common/components/controlled-picker";
import { Heading1, Heading2 } from "modules/common/components/headings";
import { CompletedProfileStackParamList } from "modules/common/types";
import { themeColor3 } from "modules/common/utils/colors";
import { formatDecimal } from "modules/common/utils/format-decimal";
import { supabase } from "modules/supabase/client";
import { getRecommendedWeeklyWeightChange } from "modules/uncompleted-profile/goal/screens/root";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";

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

  const [editGoal, setEditGoal] = useState(false);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.xl,
        }}
      >
        <Heading1>Strategy</Heading1>
        <Heading2 style={{ marginBottom: theme.spacing.lg }}>
          We have set up some targets for you to hit based on your goal which
          will help you reach it with optimal muscle growth.
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
          <>
            <Button
              title={editGoal ? "Cancel edit" : "Edit goal"}
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
                  name={editGoal ? "edit-off" : "edit"}
                  size={20}
                  style={{ marginRight: theme.spacing.md }}
                />
              }
              small
              onPress={() => {
                setEditGoal((p) => !p);
              }}
            />

            {editGoal ? (
              <EditGoal
                profile={profile!}
                setEditGoal={setEditGoal}
                goalQueryData={data.goal}
              />
            ) : (
              <>
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
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const schema = yup
  .object({
    goal: yup
      .mixed()
      .oneOf(["build-muscle", "lose-fat", "maintain"], "Invalid goal")
      .required("Goal is required"),
    approach: yup
      .mixed()
      .oneOf(["bulk", "cut", "maintain"], "Invalid approach")
      .required("Approach is required"),
    weeklyWeightChange: yup
      .number()
      .typeError("Weekly weight change is required")
      .required("Weekly weight change is required"),
  })
  .required();

type FormValues = yup.TypeOf<typeof schema>;

interface EditGoalProps {
  profile: Profile;
  setEditGoal: Dispatch<SetStateAction<boolean>>;
  goalQueryData: GoalQueryData;
}

function EditGoal({ profile, goalQueryData, setEditGoal }: EditGoalProps) {
  const { theme } = useTheme();

  const {
    watch,
    control,
    setValue,
    formState: { errors, touchedFields },
    handleSubmit,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      goal: goalQueryData.goal,
      approach: goalQueryData.approach,
      // @ts-expect-error
      weeklyWeightChange: goalQueryData.weekly_weight_change.toString(),
    },
  });

  const goal = watch("goal");
  const approach = watch("approach");

  useEffect(() => {
    if (touchedFields.approach || touchedFields.goal) {
      const {
        kgs: recommendedWeeklyKgsChange,
        lbs: recommendedWeeklyLbsChange,
      } = getRecommendedWeeklyWeightChange(approach, profile);

      setValue(
        "weeklyWeightChange",
        // @ts-expect-error
        profile?.prefered_measurement_system === "imperial"
          ? formatDecimal(recommendedWeeklyLbsChange).toString()
          : formatDecimal(recommendedWeeklyKgsChange).toString()
      );
    }
  }, [profile, approach, touchedFields.approach, touchedFields.goal]);

  useEffect(() => {
    if (goal === "build-muscle") {
      setValue("approach", "bulk");
    } else if (goal === "lose-fat") {
      setValue("approach", "cut");
    } else if (goal === "maintain") {
      setValue("approach", "maintain");
    }
  }, [goal, setValue]);

  const queryClient = useQueryClient();
  const mutation = useMutation<unknown, unknown, FormValues>({
    mutationFn: async (values) => {
      const { error: profileGoalError } = await supabase
        .from("profiles_goals")
        .update({
          approach: values.approach,
          weekly_weight_change: values.weeklyWeightChange,
          goal: values.goal,
        })
        .eq("id", profile!.goal_id);

      if (profileGoalError) {
        throw profileGoalError;
      }

      return true;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["nutritionForStrategy"],
      });

      setEditGoal(false);
    },
  });

  const updateGoal = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <>
      <ControlledPicker
        value={
          goal === "build-muscle"
            ? "Build muscle"
            : goal === "lose-fat"
            ? "Lose fat"
            : "Maintain"
        }
        label="What is your main goal right now?"
        control={control}
        name="goal"
        errorMessage={errors.goal?.message?.toString()}
      >
        <Picker.Item
          label="Build muscle"
          value="build-muscle"
          style={{ fontFamily: "InterRegular" }}
        />
        <Picker.Item
          label="Lose fat"
          value="lose-fat"
          style={{ fontFamily: "InterRegular" }}
        />
        <Picker.Item
          label="Maintain"
          value="maintain"
          style={{ fontFamily: "InterRegular" }}
        />
      </ControlledPicker>

      <View style={{ marginTop: theme.spacing.xl }}>
        <ControlledPicker
          value={
            approach === "bulk"
              ? "Bulk (caloric surplus)"
              : approach === "cut"
              ? "Cut (caloric deficit)"
              : "Maintain (caloric maintenance)"
          }
          label="Approach"
          control={control}
          name="approach"
          errorMessage={errors.approach?.message?.toString()}
        >
          {approach === "bulk" ? (
            <Picker.Item
              label="Bulk (caloric surplus)"
              value="bulk"
              style={{ fontFamily: "InterRegular" }}
            />
          ) : approach === "cut" ? (
            <Picker.Item
              label="Cut (caloric deficit)"
              value="cut"
              style={{ fontFamily: "InterRegular" }}
            />
          ) : (
            <Picker.Item
              label="Maintain (caloric maintenance)"
              value="maintain"
              style={{ fontFamily: "InterRegular" }}
            />
          )}
        </ControlledPicker>
      </View>

      <View style={{ marginTop: theme.spacing.xl }}>
        <ControlledInput
          control={control}
          label="Weekly weight change goal"
          name="weeklyWeightChange"
          keyboardType="numeric"
          helperText={
            profile?.prefered_measurement_system === "imperial" ? "lbs" : "kgs"
          }
          errorMessage={errors.weeklyWeightChange?.message?.toString()}
        />
      </View>

      {mutation.isError ? (
        <View style={{ marginTop: theme.spacing.md }}>
          <Text style={{ color: theme.colors.error, fontSize: 13 }}>
            Something went wrong updating your goal. Try again later.
          </Text>
        </View>
      ) : null}

      <Button
        title="Update goal"
        onPress={handleSubmit(updateGoal)}
        variant="1"
        style={{
          marginTop: theme.spacing.xl,
          paddingHorizontal: theme.spacing.xl,
          borderRadius: 100,
          alignSelf: "center",
        }}
      />
    </>
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
