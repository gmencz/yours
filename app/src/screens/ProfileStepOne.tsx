import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { makeStyles, Text } from "@rneui/themed";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View } from "react-native";
import { Picker as RNPicker } from "@react-native-picker/picker";
import { useState } from "react";
import {
  Activity,
  TrainingActivity,
  UncompletedProfileStackParamList,
} from "~/typings";
import { useProfileQuery } from "~/hooks/useProfileQuery";
import { useProfileStepOneMutation } from "~/hooks/useProfileStepOneMutation";
import { estimateTdee } from "~/utils/estimateTdee";
import { Button } from "~/components/Button";
import { Picker } from "~/components/Picker";
import { Input } from "~/components/Input";

const manualSchema = yup
  .object({
    tdee: yup.number().max(50000, "That TDEE is too high"),
    preferedMeasurementSystem: yup
      .mixed()
      .oneOf(["metric", "imperial"], "Invalid measurement system")
      .required("Measurement system is required"),
    gender: yup
      .mixed()
      .oneOf(["male", "female"], "Invalid gender")
      .required("Gender is required"),
    weight: yup
      .number()
      .typeError("Weight is required")
      .max(1400, "That weight is too high")
      .required("Weight is required"),
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
      .oneOf(["male", "female"], "Invalid gender")
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

type ManualSchema = yup.TypeOf<typeof manualSchema>;
type EstimatorSchema = yup.TypeOf<typeof estimatorSchema>;

type Props = NativeStackScreenProps<
  UncompletedProfileStackParamList,
  "StepOne"
>;

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

export function ProfileStepOneScreen({ navigation }: Props) {
  const { data: profile } = useProfileQuery();

  const {
    handleSubmit: manualHandleSubmit,
    control: manualControl,
    watch: manualWatch,
    formState: { errors: manualErrors },
  } = useForm<ManualSchema>({
    resolver: yupResolver(manualSchema),
    defaultValues: {
      gender: profile?.gender || "male",
      preferedMeasurementSystem: profile?.preferedMeasurementSystem || "metric",
      // @ts-expect-error because the schema says it's a number and not a string
      weight: profile?.initialWeight
        ? profile.initialWeight.toString()
        : undefined,
      // @ts-expect-error because the schema says it's a number and not a string
      tdee: profile?.initialTdeeEstimation
        ? Math.round(profile.initialTdeeEstimation).toString()
        : undefined,
    },
  });

  const {
    handleSubmit: estimatorHandleSubmit,
    control: estimatorControl,
    watch: estimatorWatch,
    formState: { errors: estimatorErrors },
  } = useForm<EstimatorSchema>({
    resolver: yupResolver(estimatorSchema),
    defaultValues: {
      preferedMeasurementSystem: profile?.preferedMeasurementSystem || "metric",
      // @ts-expect-error because the schema says it's a number and not a string
      weight: profile?.initialWeight
        ? profile.initialWeight.toString()
        : undefined,
      gender: profile?.gender || "male",
      activity: Activity.Moderate,
      trainingActivity: TrainingActivity.FourToSixWeeklySessions,
    },
  });

  const mutation = useProfileStepOneMutation({ profile: profile!, navigation });

  const [
    estimatorPreferedMeasurementSystem,
    estimatorGender,
    activity,
    trainingActivity,
  ] = estimatorWatch([
    "preferedMeasurementSystem",
    "gender",
    "activity",
    "trainingActivity",
  ]);

  const [manualPreferedMeasurementSystem, manualGender] = manualWatch([
    "preferedMeasurementSystem",
    "gender",
  ]);

  const [showCalculator, setShowCalculator] = useState(
    profile?.initialTdeeEstimation ? false : true
  );

  const estimatorGoNext = ({
    activity,
    trainingActivity,
    gender,
    age,
    weight,
    height,
    preferedMeasurementSystem,
  }: EstimatorSchema) => {
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
      preferedMeasurementSystem,
      weight: weight!,
      gender: gender!,
    });
  };

  const manualGoNext = ({
    tdee,
    preferedMeasurementSystem,
    weight,
    gender,
  }: ManualSchema) => {
    mutation.mutate({
      tdee: tdee!,
      preferedMeasurementSystem,
      weight: weight!,
      gender: gender!,
    });
  };

  const styles = useStyles();

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.stepText}>Step 1 of 2</Text>
        <Text style={styles.stepNameText}>Energy expenditure</Text>
        <Text style={styles.stepDescriptionText}>
          If you already know your{" "}
          <Text style={styles.stepDescriptionTextBold}>
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
            <View style={styles.inputContainer}>
              <Picker
                value={
                  estimatorPreferedMeasurementSystem === "imperial"
                    ? "Imperial (lbs, ft)"
                    : "Metric (kgs, cms)"
                }
                label="Measurement system"
                control={estimatorControl}
                name="preferedMeasurementSystem"
                errorMessage={estimatorErrors.preferedMeasurementSystem?.message?.toString()}
              >
                <RNPicker.Item
                  label="Metric (kgs, cms)"
                  value="metric"
                  style={styles.pickerItem}
                />
                <RNPicker.Item
                  label="Imperial (lbs, ft)"
                  value="imperial"
                  style={styles.pickerItem}
                />
              </Picker>
            </View>

            <View style={styles.inputContainer}>
              <Picker
                value={estimatorGender === "male" ? "Male" : "Female"}
                label="Gender"
                control={estimatorControl}
                name="gender"
                errorMessage={estimatorErrors.gender?.message?.toString()}
              >
                <RNPicker.Item
                  label="Male"
                  value="male"
                  style={styles.pickerItem}
                />
                <RNPicker.Item
                  label="Female"
                  value="female"
                  style={styles.pickerItem}
                />
              </Picker>
            </View>

            <View style={styles.inputContainer}>
              <Picker
                value={activityToReadable[activity as Activity]}
                label="Day-to-day activity"
                control={estimatorControl}
                name="activity"
                errorMessage={estimatorErrors.activity?.message?.toString()}
              >
                <RNPicker.Item
                  label={activityToReadable[Activity.Low]}
                  value={Activity.Low}
                  style={styles.pickerItem}
                />
                <RNPicker.Item
                  label={activityToReadable[Activity.Moderate]}
                  value={Activity.Moderate}
                  style={styles.pickerItem}
                />
                <RNPicker.Item
                  label={activityToReadable[Activity.High]}
                  value={Activity.High}
                  style={styles.pickerItem}
                />
              </Picker>
            </View>

            <View style={styles.inputContainer}>
              <Picker
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
                <RNPicker.Item
                  label={
                    trainingActivityToReadable[
                      TrainingActivity.ZeroWeeklySessions
                    ]
                  }
                  value={TrainingActivity.ZeroWeeklySessions}
                  style={styles.pickerItem}
                />
                <RNPicker.Item
                  label={
                    trainingActivityToReadable[
                      TrainingActivity.OneToThreeWeeklySessions
                    ]
                  }
                  value={TrainingActivity.OneToThreeWeeklySessions}
                  style={styles.pickerItem}
                />
                <RNPicker.Item
                  label={
                    trainingActivityToReadable[
                      TrainingActivity.FourToSixWeeklySessions
                    ]
                  }
                  value={TrainingActivity.FourToSixWeeklySessions}
                  style={styles.pickerItem}
                />
                <RNPicker.Item
                  label={
                    trainingActivityToReadable[
                      TrainingActivity.SevenPlusWeeklySessions
                    ]
                  }
                  value={TrainingActivity.SevenPlusWeeklySessions}
                  style={styles.pickerItem}
                />
              </Picker>
            </View>

            <View style={styles.inputContainer}>
              <Input
                label="Weight"
                control={estimatorControl}
                name="weight"
                suffix={
                  estimatorPreferedMeasurementSystem === "imperial"
                    ? "lbs"
                    : "kgs"
                }
                errorMessage={estimatorErrors.weight?.message}
                placeholder="Enter your weight"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Input
                label="Height"
                control={estimatorControl}
                name="height"
                suffix={
                  estimatorPreferedMeasurementSystem === "imperial"
                    ? "ft"
                    : "cms"
                }
                errorMessage={estimatorErrors.height?.message}
                placeholder="Enter your height"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Input
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
              style={styles.nextStepButton}
            />
          </>
        ) : (
          <>
            <View style={styles.inputContainer}>
              <Picker
                value={
                  manualPreferedMeasurementSystem === "imperial"
                    ? "Imperial (lbs, ft)"
                    : "Metric (kgs, cms)"
                }
                label="Measurement system"
                control={manualControl}
                name="preferedMeasurementSystem"
                errorMessage={manualErrors.preferedMeasurementSystem?.message?.toString()}
              >
                <RNPicker.Item
                  label="Metric (kgs, cms)"
                  value="metric"
                  style={styles.pickerItem}
                />
                <RNPicker.Item
                  label="Imperial (lbs, ft)"
                  value="imperial"
                  style={styles.pickerItem}
                />
              </Picker>
            </View>

            <View style={styles.inputContainer}>
              <Picker
                value={manualGender === "male" ? "Male" : "Female"}
                label="Gender"
                control={manualControl}
                name="gender"
                errorMessage={manualErrors.gender?.message?.toString()}
              >
                <RNPicker.Item
                  label="Male"
                  value="male"
                  style={styles.pickerItem}
                />
                <RNPicker.Item
                  label="Female"
                  value="female"
                  style={styles.pickerItem}
                />
              </Picker>
            </View>

            <View style={styles.inputContainer}>
              <Input
                label="Weight"
                control={manualControl}
                name="weight"
                suffix={
                  manualPreferedMeasurementSystem === "imperial" ? "lbs" : "kgs"
                }
                errorMessage={manualErrors.weight?.message}
                placeholder="Enter your weight"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Input
                label="Total daily energy expenditure (TDEE)"
                control={manualControl}
                name="tdee"
                suffix="kcal"
                errorMessage={manualErrors.tdee?.message}
                placeholder="Enter your TDEE"
                keyboardType="numeric"
              />
            </View>

            <Button
              title="Next"
              onPress={manualHandleSubmit(manualGoNext)}
              variant="1"
              style={styles.nextStepButton}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((theme) => ({
  safeAreaView: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.xl,
  },

  scrollView: {
    paddingHorizontal: theme.spacing.xl,
  },

  stepText: {
    color: theme.colors.grey1,
    marginBottom: theme.spacing.sm,
    fontSize: 13,
  },

  stepNameText: {
    fontFamily: "InterBold",
    fontSize: 18,
  },

  stepDescriptionText: {
    color: theme.colors.grey0,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },

  stepDescriptionTextBold: {
    color: theme.colors.grey0,
    fontFamily: "InterBold",
  },

  inputContainer: {
    marginTop: theme.spacing.xl,
  },

  pickerItem: {
    fontFamily: "InterRegular",
  },

  nextStepButton: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: 100,
    alignSelf: "center",
  },
}));
