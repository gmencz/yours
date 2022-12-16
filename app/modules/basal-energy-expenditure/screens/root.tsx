import { yupResolver } from "@hookform/resolvers/yup";
import { Picker } from "@react-native-picker/picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Icon, Text, useTheme } from "@rneui/themed";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfileQuery } from "modules/auth/hooks/use-profile-query";
import { Button } from "modules/common/components/button";
import { ControlledInput } from "modules/common/components/controlled-input";
import { ControlledPicker } from "modules/common/components/controlled-picker";
import { Logo } from "modules/common/components/logo";
import { UncompletedProfileStackParamList } from "modules/common/types";
import { supabase } from "modules/supabase/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";
import {
  Activity,
  estimateTdee,
  TrainingActivity,
} from "../utils/estimate-tdee";
import { Profile } from "modules/auth/hooks/use-profile-query";

const activityToReadable = {
  [Activity.Low]: "Low",
  [Activity.Moderate]: "Moderate",
  [Activity.High]: "High",
};

const trainingActivityToReadable = {
  [TrainingActivity.ZeroWeeklySessions]: "0 sessions/week",
  [TrainingActivity.OneToThreeWeeklySessions]: "1-3 sessions/week",
  [TrainingActivity.FourToSixWeeklySessions]: "4-6 sessions/week",
  [TrainingActivity.SevenPlusWeeklySessions]: "7+ sessions/week",
};

const manualSchema = yup
  .object({
    tdee: yup.number().max(50000, "That TDEE is too high"),
  })
  .required();

const estimatorSchema = yup
  .object({
    preferedMeasurementSystem: yup
      .mixed()
      .oneOf(["metric", "imperial"], "Invalid measurement system")
      .required("Measurement system is required"),

    gender: yup
      .mixed()
      .oneOf(["man", "woman"], "Invalid gender")
      .required("Gender is required"),
    weight: yup
      .number()
      .typeError("Weight is required")
      .max(1400, "That weight is too high")
      .required("Weight is required"),
    height: yup
      .number()
      .typeError("Height is required")
      .max(272, "That height is too high")
      .required("Height is required"),
    age: yup
      .number()
      .typeError("Age is required")
      .max(120, "That age is too high")
      .required("Age is required"),
    activity: yup
      .mixed()
      .oneOf(Object.values(Activity), "Invalid activity")
      .required("Activity is required"),
    trainingActivity: yup
      .mixed()
      .oneOf(Object.values(TrainingActivity), "Invalid training activity")
      .required("Activity is required"),
  })
  .required();

type ManualFormValues = yup.TypeOf<typeof manualSchema>;
type EstimatorFormValues = yup.TypeOf<typeof estimatorSchema>;

type Props = NativeStackScreenProps<
  UncompletedProfileStackParamList,
  "BasalEnergyExpenditure"
>;

export function BasalEnergyExpenditureScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { data: profile } = useProfileQuery();

  const {
    handleSubmit: manualHandleSubmit,
    control: manualControl,
    watch: manualWatch,
    formState: { errors: manualErrors },
  } = useForm<ManualFormValues>({
    resolver: yupResolver(manualSchema),
    defaultValues: {
      // @ts-expect-error because we are providing a string but this is actually correct because
      // RN expects a string even tho react-hook-form will transform it with yup.
      tdee: profile?.starting_tdee
        ? Math.round(profile.starting_tdee).toString()
        : undefined,
    },
  });

  const {
    handleSubmit: estimatorHandleSubmit,
    control: estimatorControl,
    watch: estimatorWatch,
    formState: { errors: estimatorErrors },
  } = useForm<EstimatorFormValues>({
    resolver: yupResolver(estimatorSchema),
    defaultValues: {
      preferedMeasurementSystem: "metric",
      gender: "man",
      activity: Activity.Moderate,
      trainingActivity: TrainingActivity.FourToSixWeeklySessions,
    },
  });

  const queryClient = useQueryClient();

  const mutation = useMutation<unknown, unknown, { tdee: number }>({
    mutationFn: async ({ tdee }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ starting_tdee: tdee })
        .eq("id", profile!.id);

      if (error) {
        throw error;
      }

      return true;
    },

    onSuccess: (_data, { tdee }) => {
      const queryData = queryClient.getQueryData<Profile>(["profile"]);
      if (queryData) {
        queryClient.setQueryData<Profile>(["profile"], {
          ...queryData,
          starting_tdee: tdee,
        });
      }

      navigation.navigate("Goal");
    },
  });

  const preferedMeasurementSystem = estimatorWatch("preferedMeasurementSystem");
  const gender = estimatorWatch("gender");
  const activity = estimatorWatch("activity");
  const trainingActivity = estimatorWatch("trainingActivity");
  const [showCalculator, setShowCalculator] = useState(
    profile?.starting_tdee ? false : true
  );

  const estimatorGoNext = ({
    activity,
    trainingActivity,
    gender,
    age,
    weight,
    height,
    preferedMeasurementSystem,
  }: EstimatorFormValues) => {
    mutation.mutate({
      tdee: estimateTdee({
        preferedMeasurementSystem,
        activity,
        age: age!,
        gender,
        height: height!,
        trainingActivity,
        weight: weight!,
      }),
    });
  };

  const manualGoNext = ({ tdee }: ManualFormValues) => {
    mutation.mutate({
      tdee: tdee!,
    });
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingVertical: theme.spacing.xl,
      }}
    >
      <ScrollView style={{ paddingHorizontal: theme.spacing.xl }}>
        <Text
          style={{
            color: theme.colors.grey1,
            marginBottom: theme.spacing.sm,
            fontSize: 13,
          }}
        >
          Step 1 of 2
        </Text>

        <Text
          style={{
            fontFamily: "InterBold",
            fontSize: 18,
          }}
        >
          Energy expenditure
        </Text>

        <Text
          style={{
            color: theme.colors.grey0,
            marginTop: theme.spacing.md,
            marginBottom: theme.spacing.lg,
          }}
        >
          If you already know your{" "}
          <Text
            style={{
              color: theme.colors.grey0,
              fontFamily: "InterBold",
            }}
          >
            total daily energy expenditure (TDEE)
          </Text>
          , you can tap on the button below, otherwise we will estimate it based
          on some factors.
        </Text>

        <Button
          title={
            showCalculator ? "I already know my TDEE" : "Use our TDEE estimator"
          }
          onPress={() => {
            setShowCalculator((prev) => !prev);
          }}
          variant="1"
        />

        {showCalculator ? (
          <>
            <View style={{ marginTop: theme.spacing.xl }}>
              <ControlledPicker
                value={
                  preferedMeasurementSystem === "imperial"
                    ? "Imperial (lbs, ft)"
                    : "Metric (kgs, cms)"
                }
                label="Measurement system"
                control={estimatorControl}
                name="preferedMeasurementSystem"
                errorMessage={estimatorErrors.preferedMeasurementSystem?.message?.toString()}
              >
                <Picker.Item
                  label="Metric (kgs, cms)"
                  value="metric"
                  style={{ fontFamily: "InterRegular" }}
                />
                <Picker.Item
                  label="Imperial (lbs, ft)"
                  value="imperial"
                  style={{ fontFamily: "InterRegular" }}
                />
              </ControlledPicker>
            </View>

            <View style={{ marginTop: theme.spacing.xl }}>
              <ControlledPicker
                value={gender === "man" ? "Man" : "Woman"}
                label="Gender"
                control={estimatorControl}
                name="gender"
                errorMessage={estimatorErrors.gender?.message?.toString()}
              >
                <Picker.Item
                  label="Man"
                  value="man"
                  style={{ fontFamily: "InterRegular" }}
                />
                <Picker.Item
                  label="Woman"
                  value="woman"
                  style={{ fontFamily: "InterRegular" }}
                />
              </ControlledPicker>
            </View>

            <View style={{ marginTop: theme.spacing.xl }}>
              <ControlledPicker
                value={activityToReadable[activity as Activity]}
                label="Day-to-day activity"
                control={estimatorControl}
                name="activity"
                errorMessage={estimatorErrors.activity?.message?.toString()}
              >
                <Picker.Item
                  label={activityToReadable[Activity.Low]}
                  value={Activity.Low}
                  style={{ fontFamily: "InterRegular" }}
                />
                <Picker.Item
                  label={activityToReadable[Activity.Moderate]}
                  value={Activity.Moderate}
                  style={{ fontFamily: "InterRegular" }}
                />
                <Picker.Item
                  label={activityToReadable[Activity.High]}
                  value={Activity.High}
                  style={{ fontFamily: "InterRegular" }}
                />
              </ControlledPicker>
            </View>

            <View style={{ marginTop: theme.spacing.xl }}>
              <ControlledPicker
                value={
                  trainingActivityToReadable[
                    trainingActivity as TrainingActivity
                  ]
                }
                label="Training activity"
                control={estimatorControl}
                name="trainingActivity"
                errorMessage={estimatorErrors.trainingActivity?.message?.toString()}
              >
                <Picker.Item
                  label={
                    trainingActivityToReadable[
                      TrainingActivity.ZeroWeeklySessions
                    ]
                  }
                  value={TrainingActivity.ZeroWeeklySessions}
                  style={{ fontFamily: "InterRegular" }}
                />
                <Picker.Item
                  label={
                    trainingActivityToReadable[
                      TrainingActivity.OneToThreeWeeklySessions
                    ]
                  }
                  value={TrainingActivity.OneToThreeWeeklySessions}
                  style={{ fontFamily: "InterRegular" }}
                />
                <Picker.Item
                  label={
                    trainingActivityToReadable[
                      TrainingActivity.FourToSixWeeklySessions
                    ]
                  }
                  value={TrainingActivity.FourToSixWeeklySessions}
                  style={{ fontFamily: "InterRegular" }}
                />
                <Picker.Item
                  label={
                    trainingActivityToReadable[
                      TrainingActivity.SevenPlusWeeklySessions
                    ]
                  }
                  value={TrainingActivity.SevenPlusWeeklySessions}
                  style={{ fontFamily: "InterRegular" }}
                />
              </ControlledPicker>
            </View>

            <View style={{ marginTop: theme.spacing.xl }}>
              <ControlledInput
                label="Weight"
                control={estimatorControl}
                name="weight"
                helperText={
                  preferedMeasurementSystem === "imperial" ? "lbs" : "kgs"
                }
                errorMessage={estimatorErrors.weight?.message}
                placeholder="Enter your weight"
                keyboardType="numeric"
              />
            </View>

            <View style={{ marginTop: theme.spacing.xl }}>
              <ControlledInput
                label="Height"
                control={estimatorControl}
                name="height"
                helperText={
                  preferedMeasurementSystem === "imperial" ? "ft" : "cms"
                }
                errorMessage={estimatorErrors.height?.message}
                placeholder="Enter your height"
                keyboardType="numeric"
              />
            </View>

            <View style={{ marginTop: theme.spacing.xl }}>
              <ControlledInput
                label="Age"
                control={estimatorControl}
                name="age"
                errorMessage={estimatorErrors.age?.message}
                placeholder="Enter your age"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            <Button
              title="Next"
              onPress={estimatorHandleSubmit(estimatorGoNext)}
              variant="1"
              style={{
                marginTop: theme.spacing.xl,
                paddingHorizontal: theme.spacing.xl,
                borderRadius: 100,
                alignSelf: "center",
              }}
            />
          </>
        ) : (
          <>
            <View style={{ marginTop: theme.spacing.xl }}>
              <ControlledInput
                label="Total daily energy expenditure (TDEE)"
                control={manualControl}
                name="tdee"
                helperText="kcal"
                errorMessage={manualErrors.tdee?.message}
                placeholder="Enter your TDEE"
                keyboardType="numeric"
              />
            </View>

            <Button
              title="Next"
              onPress={manualHandleSubmit(manualGoNext)}
              variant="1"
              style={{
                marginTop: theme.spacing.xl,
                paddingHorizontal: theme.spacing.xl,
                borderRadius: 100,
                alignSelf: "center",
              }}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
