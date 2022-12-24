import { yupResolver } from "@hookform/resolvers/yup";
import { Picker } from "@react-native-picker/picker";
import { Text, useTheme } from "@rneui/themed";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Profile } from "modules/auth/hooks/use-profile-query";
import { Button } from "modules/common/components/button";
import { ControlledInput } from "modules/common/components/controlled-input";
import { ControlledPicker } from "modules/common/components/controlled-picker";
import { formatDecimal } from "modules/common/utils/format-decimal";
import { supabase } from "modules/supabase/client";
import { getRecommendedWeeklyWeightChange } from "modules/uncompleted-profile/goal/utils/get-recommended-weekly-weight-change";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import * as yup from "yup";
import { UseStrategyQueryData } from "../hooks/use-strategy-query";

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
  goalQueryData: UseStrategyQueryData["goal"];
}

export function EditGoal({
  profile,
  goalQueryData,
  setEditGoal,
}: EditGoalProps) {
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
        queryKey: ["strategy"],
      });

      setEditGoal(false);
    },
    onError: () => {
      Toast.show({
        type: "error",
        text2: "Oops! Something went wrong updating your goal.",
      });
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
