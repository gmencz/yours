import { yupResolver } from "@hookform/resolvers/yup";
import { useTheme } from "@rneui/themed";
import { Picker as RNPicker } from "@react-native-picker/picker";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import * as yup from "yup";
import { Profile } from "~/hooks/useProfileQuery";
import { UseStrategyQueryData } from "~/hooks/useStrategyQuery";
import { getRecommendedWeeklyWeightChange } from "~/utils/getRecommendedWeeklyWeightChange";
import { formatDecimal } from "~/utils/formatDecimal";
import { useEditGoalMutation } from "~/hooks/useEditGoalMutation";
import { Picker } from "./Picker";
import { Input } from "./Input";
import { Button } from "./Button";
import { useLatestTdeeEstimationQuery } from "~/hooks/useLatestTdeeEstimationQuery";

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

type Schema = yup.TypeOf<typeof schema>;

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
  } = useForm<Schema>({
    resolver: yupResolver(schema),
    defaultValues: {
      goal: goalQueryData.goal,
      approach: goalQueryData.approach,
      // @ts-expect-error because the schema says it's a number and not a string
      weeklyWeightChange: goalQueryData.weekly_weight_change.toString(),
    },
  });

  const goal = watch("goal");
  const approach = watch("approach");

  const { data: latestTdeeEstimation } = useLatestTdeeEstimationQuery({
    profileId: profile.id,
  });

  useEffect(() => {
    if (touchedFields.approach || touchedFields.goal) {
      // TODO: Take into account the latest weight here instead of the initial weight from the profile
      // when calculating this.
      const {
        kgs: recommendedWeeklyKgsChange,
        lbs: recommendedWeeklyLbsChange,
      } = getRecommendedWeeklyWeightChange(
        approach,
        profile,
        latestTdeeEstimation ? latestTdeeEstimation.weight : undefined
      );

      setValue(
        "weeklyWeightChange",
        // @ts-expect-error because the schema says it's a number and not a string
        profile?.prefered_measurement_system === "imperial"
          ? formatDecimal(recommendedWeeklyLbsChange).toString()
          : formatDecimal(recommendedWeeklyKgsChange).toString()
      );
    }
  }, [
    profile,
    approach,
    touchedFields.approach,
    touchedFields.goal,
    latestTdeeEstimation,
    setValue,
  ]);

  useEffect(() => {
    if (goal === "build-muscle") {
      setValue("approach", "bulk");
    } else if (goal === "lose-fat") {
      setValue("approach", "cut");
    } else if (goal === "maintain") {
      setValue("approach", "maintain");
    }
  }, [goal, setValue]);

  const mutation = useEditGoalMutation({ profile, setEditGoal });

  const updateGoal = (values: Schema) => {
    mutation.mutate({
      approach: values.approach,
      goal: values.goal,
      weeklyWeightChange: values.weeklyWeightChange!,
    });
  };

  return (
    <>
      <Picker
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
        <RNPicker.Item
          label="Build muscle"
          value="build-muscle"
          style={{ fontFamily: "SoraRegular" }}
        />
        <RNPicker.Item
          label="Lose fat"
          value="lose-fat"
          style={{ fontFamily: "SoraRegular" }}
        />
        <RNPicker.Item
          label="Maintain"
          value="maintain"
          style={{ fontFamily: "SoraRegular" }}
        />
      </Picker>

      <View style={{ marginTop: theme.spacing.xl }}>
        <Picker
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
            <RNPicker.Item
              label="Bulk (caloric surplus)"
              value="bulk"
              style={{ fontFamily: "SoraRegular" }}
            />
          ) : approach === "cut" ? (
            <RNPicker.Item
              label="Cut (caloric deficit)"
              value="cut"
              style={{ fontFamily: "SoraRegular" }}
            />
          ) : (
            <RNPicker.Item
              label="Maintain (caloric maintenance)"
              value="maintain"
              style={{ fontFamily: "SoraRegular" }}
            />
          )}
        </Picker>
      </View>

      <View style={{ marginTop: theme.spacing.xl }}>
        <Input
          control={control}
          label="Weekly weight change goal"
          name="weeklyWeightChange"
          keyboardType="numeric"
          suffix={
            profile?.preferedMeasurementSystem === "imperial" ? "lbs" : "kgs"
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
