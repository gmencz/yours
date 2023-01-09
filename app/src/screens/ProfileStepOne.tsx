import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { makeStyles, Text, useThemeMode } from "@rneui/themed";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ScrollView, View } from "react-native";
import { Picker as RNPicker } from "@react-native-picker/picker";
import {
  Activity,
  TrainingActivity,
  UncompletedProfileStackParamList,
} from "~/typings";
import { useProfileQuery } from "~/hooks/useProfileQuery";
import { Button } from "~/components/Button";
import { Picker } from "~/components/Picker";
import { Input } from "~/components/Input";
import { Defs, G, Mask, Path, Svg } from "react-native-svg";
import { useProfileStepOneMutation } from "~/hooks/useProfileStepOneMutation";
import { ProfileStepIndicator } from "~/components/ProfileStepIndicator";

const schema = yup
  .object({
    preferedMeasurementSystem: yup
      .mixed()
      .oneOf(["metric", "imperial"], "Invalid measurement system")
      .required("Measurement system is required"),

    sex: yup
      .mixed()
      .oneOf(["male", "female"], "Invalid sex")
      .required("Sex is required"),
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

type Schema = yup.TypeOf<typeof schema>;

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
  const { mode } = useThemeMode();
  const styles = useStyles({ mode });
  const { data: profile } = useProfileQuery();
  const {
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<Schema>({
    resolver: yupResolver(schema),
    defaultValues: {
      preferedMeasurementSystem: profile?.preferedMeasurementSystem || "metric",
      // @ts-expect-error because the schema says it's a number and not a string
      weight: profile?.initialWeight
        ? profile.initialWeight.toString()
        : undefined,
      sex: profile?.sex || "male",
      activity: profile?.activity || Activity.Moderate,
      trainingActivity:
        profile?.trainingActivity || TrainingActivity.FourToSixWeeklySessions,
      // @ts-expect-error because the schema says it's a number and not a string
      age: profile?.age ? profile.age.toString() : undefined,
      // @ts-expect-error because the schema says it's a number and not a string
      height: profile?.height ? profile.height.toString() : undefined,
    },
  });

  const [preferedMeasurementSystem, sex, activity, trainingActivity] = watch([
    "preferedMeasurementSystem",
    "sex",
    "activity",
    "trainingActivity",
  ]);

  const mutation = useProfileStepOneMutation({ profile: profile!, navigation });

  const goNext = ({
    preferedMeasurementSystem,
    weight,
    sex,
    activity,
    age,
    height,
    trainingActivity,
  }: Schema) => {
    mutation.mutate({
      preferedMeasurementSystem,
      weight: weight!,
      sex: sex!,
      activity: activity!,
      age: age!,
      height: height!,
      trainingActivity: trainingActivity!,
    });
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.shapesContainer}>
        <Shapes />
      </View>

      <View style={styles.mainContainer}>
        <Text style={styles.stepTitle}>Tell us more about you</Text>

        <Text style={styles.stepDescription}>
          We need this so we can give you the most accurate nutrition
          information possible.
        </Text>

        <Picker
          value={
            preferedMeasurementSystem === "imperial"
              ? "Imperial (lbs, ft)"
              : "Metric (kgs, cms)"
          }
          label="Measurement system"
          control={control}
          name="preferedMeasurementSystem"
          errorMessage={errors.preferedMeasurementSystem?.message?.toString()}
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

        <View style={styles.formControl}>
          <Picker
            value={sex === "male" ? "Male" : "Female"}
            label="Sex"
            control={control}
            name="sex"
            errorMessage={errors.sex?.message?.toString()}
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

        <View style={styles.formControl}>
          <Input
            label="Weight"
            control={control}
            name="weight"
            suffix={preferedMeasurementSystem === "imperial" ? "lbs" : "kgs"}
            errorMessage={errors.weight?.message}
            placeholder="Enter your weight"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formControl}>
          <Picker
            value={activityToReadable[activity as Activity]}
            label="Day-to-day activity"
            control={control}
            name="activity"
            errorMessage={errors.activity?.message?.toString()}
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

        <View style={styles.formControl}>
          <Picker
            value={
              trainingActivityToReadable[trainingActivity as TrainingActivity]
            }
            label="Training activity"
            control={control}
            name="trainingActivity"
            errorMessage={errors.trainingActivity?.message?.toString()}
          >
            <RNPicker.Item
              label={
                trainingActivityToReadable[TrainingActivity.ZeroWeeklySessions]
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

        <View style={styles.formControl}>
          <Input
            label="Height"
            control={control}
            name="height"
            suffix={preferedMeasurementSystem === "imperial" ? "ft" : "cms"}
            errorMessage={errors.height?.message}
            placeholder="Enter your height"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formControl}>
          <Input
            label="Age"
            control={control}
            name="age"
            errorMessage={errors.age?.message}
            placeholder="Enter your age"
            keyboardType="numeric"
            maxLength={3}
          />
        </View>

        <View style={styles.stepBottomContainer}>
          <ProfileStepIndicator currentStepNumber={1} />

          <Button
            style={styles.nextButton}
            title="Next"
            onPress={handleSubmit(goNext)}
            variant="3"
          />
        </View>
      </View>
    </ScrollView>
  );
}

function Shapes() {
  return (
    <Svg
      width={600}
      height={100}
      preserveAspectRatio="none"
      viewBox="0 0 600 100"
    >
      <G mask='url("#SvgjsMask1003")' fill="none" strokeWidth={2}>
        <Path
          d="M45.21 0C48.43.66 47.1 5.11 50 5.11c5.12 0 5.33-3.9 11.25-5.11C67.83-1.35 68.13 0 75 0c5.29 0 6.08-2.18 10.58 0 8 3.87 7.89 12.1 14.42 12.1 5.26 0 3.04-9.14 9.15-12.1 6.39-3.09 7.92 0 15.85 0h100c11.95 0 12.6-1.03 23.91 0 1.19.11.66 1.09 1.09 2.27 4.14 11.32.94 14.34 8.06 22.73 5.38 6.34 8.78 6.73 16.94 6.73 5.66 0 9.79-1.47 10.71-6.73 1.86-10.61-9.21-17.9-5.15-25 3.09-5.4 9.72 0 19.44 0h175c10.38 0 19.31-5.26 20.76 0 2 7.24-15.11 15.12-13.86 25 .87 6.93 9.29 8.61 18.1 8.61 7.15 0 13.18-2.3 13.82-8.61 1.07-10.49-13.51-18.04-10.4-25 2.48-5.54 10.79 0 21.58 0h50c12.5 0 18.75-6.25 25 0s0 12.5 0 25v25c0 9.62 4.55 12.94 0 19.23-4.5 6.21-14.01-.87-18.1 5.77-5.38 8.74 1.94 14.94-.84 25-.67 2.44-3.03 0-6.06 0H475c-10.35 0-15.43 5.64-20.69 0-6.39-6.86-.67-12.74-2.6-25-.22-1.42-.5-2.36-1.71-2.36-2.77 0-5.53-.52-6.25 2.36-2.69 10.8 4.86 17.76-.57 25-3.95 5.26-9.09 0-18.18 0h-75c-1 0-1.04.26-2 0-11.54-3.09-13.01-.74-23-6.69-11-6.55-9.67-8.98-18.98-18.31-3.19-3.2-1.91-6.18-6.02-6.76-11.4-1.6-12.48 1.39-25 2.41-12.48 1.02-12.87-.18-25 1.66-2.2.33-3.65 1.05-3.65 2.69 0 2.28 1.78 2.6 3.65 5.15 7.29 9.95 14.67 13.62 14.67 19.85 0 3.7-7.33 0-14.67 0h-50c-7.86 0-8.15 1.33-15.71 0-4.94-.87-4.48-4.39-9.29-4.39-7.22 0-7.26 3.07-14.77 4.39-4.99.88-5.11 0-10.23 0-6.25 0-6.51 1.28-12.5 0-6.51-1.4-5.9-4.3-12.5-5.36-12.15-1.95-13.47-2.68-25-.67-3.83.67-1.95 5.12-5.71 6.03-8.74 2.11-9.64 0-19.29 0H25c-11.61 0-12.2 1.14-23.21 0C.3 99.85.11 98.95 0 97.41-.78 86.45 0 86.2 0 75V50 25C0 12.5-6.25 6.25 0 0s12.5 0 25 0c10.11 0 10.93-1.9 20.21 0"
          stroke="rgba(238, 236, 164, 1)"
        />
        <Path
          d="M125 15.12c-5.61 0-6.5 4.87-12.88 9.88-6.12 4.81-7.44 3.78-12.12 9.76-5.1 6.52-7.44 8.32-7.44 15.24 0 4.13 2.88 6.87 7.44 6.87 11.66 0 14.56-10.77 25-6.87 13.84 5.17 12.59 12.03 23.57 25 1.52 1.8.87 4.55 1.43 4.55.55 0 .1-2.35.79-4.55 3.94-12.58 8.75-13.71 8.48-25-.13-5.26-4.7-3.98-9.27-8.1-9.29-8.38-9.98-7.81-18.46-16.9-4.02-4.3-2.44-9.88-6.54-9.88M425 19.79c-8.07 0-17.05 2.67-17.05 5.21 0 2.53 8.94 4.93 17.05 4.93 3.89 0 6.94-2.42 6.94-4.93 0-2.56-3.01-5.21-6.94-5.21"
          stroke="rgba(104, 96, 164, 1)"
        />
        <Path
          d="M200 49.26c-.31 0-.62.41-.62.74 0 .27.31.46.62.46.32 0 .64-.19.64-.46 0-.33-.32-.74-.64-.74"
          stroke="rgba(238, 236, 164, 1)"
        />
        <Path
          d="M325 27.27c-2.22 0-3.91 12.06-3.91 22.73 0 2.4 1.85 3.42 3.91 3.42 2.4 0 5-.72 5-3.42 0-10.37-2.76-22.73-5-22.73"
          stroke="rgba(124, 121, 135, 1)"
        />
        <Path
          d="M525 36.18c-6.61 3.23-8.61 7.86-8.61 13.82 0 3.77 4.1 3.18 8.61 5.65 12.29 6.72 15.72 14.4 25 12.73 6.44-1.16 6.44-9.25 6.44-18.38 0-8.28.05-13.6-6.44-16.45-9.23-4.06-14.8-2.36-25 2.63"
          stroke="rgba(238, 236, 164, 1)"
        />
        <Path
          d="M25 62.23c-5.85 0-12 6.82-12 12.77 0 5.2 6.11 9.52 12 9.52 5.57 0 10.91-4.36 10.91-9.52 0-5.99-5.3-12.77-10.91-12.77"
          stroke="rgba(104, 96, 164, 1)"
        />
        <Path
          d="M31.91 0C41.82 7.66 40.05 10.87 50 19.32c4.77 4.05 5.65 2.9 11.36 5.68 6.79 3.32 8.68 1.3 13.64 6.52C81.92 38.8 78.75 41.79 85.12 50c6.13 7.9 6.06 9.55 14.88 13.74 11.12 5.28 13.42.95 25 5.2 3.78 1.38 5.71 3.2 5.71 6.06 0 2.55-2.29 3.45-5.71 4.76-11.94 4.58-13.97 1.07-25 7.02-7.72 4.17-5.09 9.3-12.5 13.22-5.09 2.69-6.25 0-12.5 0-8.99 0-12.06 4.43-17.97 0-6.59-4.94-3.39-9.43-7.03-18.75-1.24-3.18-2.73-3.12-2.73-6.25 0-3.12 1.32-3.15 2.73-6.25 4.28-9.4 8.65-9.51 8.65-18.75 0-8.17-2.17-15.87-8.65-16.07-10.35-.32-12.61 7.38-25 15.03-.62.38-.52.51-1.02 1.04C12.23 62.49 12.15 62.43.5 75c-.34.36-.37.86-.5.86-.12 0 0-.43 0-.86V50 25C0 12.5-6.25 6.25 0 0s12.5 0 25 0c3.45 0 4.32-2 6.91 0M125 .58c-.39 0-.61-.41-.61-.58 0-.12.3 0 .61 0 1.39 0 2.78-.14 2.78 0 0 .15-1.47.58-2.78.58"
          stroke="rgba(238, 236, 164, 1)"
        />
        <Path
          d="M141.15 25c0-8.41 3.29-10.15 8.85-18.55 2.71-4.1 3.1-5.27 7.69-6.45 7.91-2.04 8.66 0 17.31 0h25c11.76 0 22.07-5.48 23.53 0 1.87 7.02-7.77 13.08-16.86 25-2.68 3.52-3.67 2.61-6.67 5.88-8.46 9.23-16.25 10.49-16.25 19.12 0 6.95 8.09 12.04 16.25 12.04 8.3 0 8.89-5.4 16.67-12.04 4.72-4.03 2.96-6.52 8.33-9.29 11.29-5.82 12.43-7.66 25-7.9 12.43-.24 13.28 8.82 25 6.93 12.52-2.02 19.84-4.61 23.47-14.74 3.49-9.74-9.77-16.1-9.23-25 .22-3.6 5.38 0 10.76 0h50c8.65 0 14.42-5.09 17.31 0 4.2 7.41-5.71 14.53-3.14 25 1.28 5.22 6.18 2.23 10.83 6.37 9.4 8.36 8.76 9.21 17.27 18.63 3.99 4.41 3.82 9.04 7.73 9.04 3.97 0 3.41-5.19 8.02-9.04 7.89-6.59 8.52-5.88 16.98-11.84 9.29-6.54 18.52-6.46 18.52-13.16 0-6.83-8.44-8.41-18.52-13.89-11.68-6.36-12.54-4.81-25-9.79-1.43-.57-2.78-.97-2.78-1.32 0-.31 1.39 0 2.78 0h75c5.09 0 10.17-2.66 10.17 0 0 4.66-4.09 8.27-10.17 14.63-5.86 6.14-13.71 5.86-13.71 10.37 0 4 6.86 3.31 13.71 6.64 12.51 6.09 13.13 5.22 25 12.21 3.71 2.19 2.67 3.57 6.15 6.15 9.02 6.68 9.47 6.12 18.85 12.37 9.37 6.25 9.99 5.59 18.65 12.63 3.84 3.12 2.95 4.05 6.35 7.69 8.27 8.86 16.98 12.22 16.98 17.31 0 3.56-8.49 0-16.98 0h-75c-6.75 0-10.93 4.38-13.51 0-4.78-8.12 2.16-13.48-1.22-25-2.36-8.05-3.26-13.07-10.27-14.15-10.62-1.64-13.1 3.33-25 8.72-3.72 1.69-6.25 2.25-6.25 5.43 0 4.53 3.52 4.79 6.25 10 3.81 7.29 6.82 9.7 6.82 15 0 2.2-3.41 0-6.82 0h-50c-2.91 0-3.21 1.14-5.83 0-9.88-4.29-8.87-7.6-19.17-10.85-11.78-3.72-13.83 1.24-25-3.1-7.06-2.74-11.45-5.29-11.45-11.05 0-6.27 4.94-7.39 11.45-13.01 7.97-6.88 14.15-3.53 17.5-11.99 3.97-10.04 1.75-13.88-2.87-25-4.13-9.95-6.42-17.14-14.63-17.14-10.22 0-18.7 6.29-22.22 17.14-3.31 10.22 9.44 13.9 8.55 25-.5 6.3-4.53 7.63-11.33 9.8-11.37 3.63-12.49 1.07-25 1.79-12.49.72-13.6-2.57-25 1.1-9.44 3.04-16.67 4.82-16.67 12.31 0 10.43 8.32 11.78 16.67 23.53.53.75 1.09 1.01 1.09 1.47 0 .27-.54 0-1.09 0h-25c-8.75 0-8.88.83-17.5 0-3.88-.38-3.84-.97-7.5-2.42-12.59-4.97-13.39-3.75-25-10.42-8.04-4.62-13.12-4.45-14.29-12.16-1.65-10.87 11.36-14.37 8.64-25-2.64-10.32-9.74-8.38-19.35-16.9-4.49-3.98-8.85-3.19-8.85-8.1M525 20.65c-9.36-4.4-13.01-13.92-13.01-20.65 0-3.59 6.5 0 13.01 0h50c12.5 0 17.82-5.32 25 0 5.32 3.93 5.29 15.33 0 18.5-7.21 4.33-12.48-3.34-25-3.5-12.48-.16-12.5 1.45-25 2.86s-15.35 7.32-25 2.79M562.89 50c0-8.42 3.78-12.19 12.11-16.55 10.22-5.34 17.94-7.52 25-2.85 5.44 3.6 0 9.7 0 19.4 0 6.18 4.06 9.38 0 12.36-8.44 6.2-15 9.33-25 6-8.55-2.85-12.11-9.33-12.11-18.36M16.67 100c0-1.52 4-5.56 8.33-5.56 5.31 0 10.94 4.09 10.94 5.56 0 1.31-5.47 0-10.94 0-4.16 0-8.33 1.26-8.33 0"
          stroke="rgba(104, 96, 164, 1)"
        />
        <Path
          d="M2.17 25c0-1.11-2.04-.75-2.17-2.27C-.95 11.75-4.63 6.74 0 0c3.18-4.63 8.81-2.48 15.62 0 5.69 2.07 4.86 4.38 9.38 9.09 7.46 7.79 14.58 8.63 14.58 15.91 0 6.15-7.76 4.93-14.58 10.94-7.36 6.49-6.96 6.96-13.78 14.06C5.54 55.91 3.24 61.96 0 61.96c-2.37 0 0-5.98 0-11.96 0-11.46-.96-11.87 0-22.92.13-1.45 2.17-1.02 2.17-2.08"
          stroke="rgba(124, 121, 135, 1)"
        />
        <Path
          d="M156.25 25c0-5.24 11.37-4.04 18.75-11.54 4.91-5 .41-10.54 5.83-13.46 7.08-3.81 9.59 0 19.17 0 5.63 0 11.27-2.74 11.27 0 0 4.44-4.41 8.6-11.27 14.37-8.01 6.73-10.23 4.21-18.48 10.63-4.25 3.3-2.15 8.82-6.52 8.82-8.26 0-18.75-3.88-18.75-8.82"
          stroke="rgba(104, 96, 164, 1)"
        />
        <Path
          d="M300 5.36c-1.84 0-2.08-3.39-2.08-5.36 0-.71 1.04 0 2.08 0 3.75 0 7.5-1.2 7.5 0 0 1.48-4.55 5.36-7.5 5.36M425 2.43c-2.93-.93-5.65-1.8-5.65-2.43 0-.58 2.82 0 5.65 0h25c10.94 0 21.88-2.32 21.88 0 0 2.54-10.65 9.14-21.88 9.72-12.21.63-12.6-3.36-25-7.29"
          stroke="rgba(238, 236, 164, 1)"
        />
        <Path
          d="M525 7.07c-3.65-.37-4.45-4.76-4.45-7.07 0-1.23 2.23 0 4.45 0h50c12.5 0 14.92-2.42 25 0 2.42.58 2.42 5.56 0 6-10.08 1.85-12.5-.67-25-1.42-12.5-.76-12.57-2.22-25-1.6-12.57.63-13.93 5.21-25 4.09"
          stroke="rgba(124, 121, 135, 1)"
        />
        <Path
          d="M70.67 50c.76-3.08 2.44-4.89 4.33-4.89 1.61 0 .74 2.91 2.68 4.89C88.24 60.77 87.91 61.83 100 70.6c5.13 3.73 12.12 2.16 12.12 4.4 0 2.26-7.16.65-12.12 4.6-10.74 8.55-8.9 11.92-19.29 20.4-2.11 1.72-2.86 0-5.71 0-4.1 0-7.29 3.09-8.2 0-2.79-9.41-.17-12.54.79-25 .97-12.54.14-13.13 3.08-25"
          stroke="rgba(104, 96, 164, 1)"
        />
        <Path
          d="M240 50c0-1.84 4.72-3.83 10-4.17 12.22-.78 12.49 1.85 25 1.93 12.49.08 13.61-2.57 25-1.61 1.89.16 1.56 2.11 1.56 3.85 0 .86-.55 1.25-1.56 1.35-12.27 1.17-12.49.76-25 1.19-12.49.43-12.66 1.44-25 .54-5.16-.37-10-1.3-10-3.08M360.87 50c0-3.84 7.71-6.37 14.13-6.37 3.6 0 5.91 2.88 5.91 6.37 0 4.62-1.9 9.85-5.91 9.85-6.01 0-14.13-5.58-14.13-9.85"
          stroke="rgba(124, 121, 135, 1)"
        />
        <Path
          d="M419.81 50c0-2.13 2.19-3.62 5.19-3.62 10.17 0 21.15 1.25 21.15 3.62 0 2.43-11.47 5.98-21.15 5.98-3.49 0-5.19-3.31-5.19-5.98"
          stroke="rgba(238, 236, 164, 1)"
        />
        <Path
          d="M452.08 50c1.38-7.53 11.69-8.59 22.92-8.59 8.82 0 9.59 3.05 17.19 8.59 4.9 3.57 2.61 6.6 7.81 9.62 11.21 6.52 12.9 3.95 25 9.47 4.77 2.17 5.08 2.17 8.73 5.91 8.85 9.07 7.95 10.02 16.27 19.71 2.41 2.81 5.19 3.73 5.19 5.29 0 1.09-2.59 0-5.19 0h-75c-3.16 0-5.7 2.52-6.32 0-2.46-9.98 3.93-13.66.16-25-4.53-13.66-18.46-15.74-16.76-25"
          stroke="rgba(104, 96, 164, 1)"
        />
        <Path
          d="M569.33 50c0-3.94 1.42-6.55 5.67-7.75 11.08-3.11 15.7-3.75 25-.87 3.2.99 0 4.31 0 8.62 0 2.75 2.24 4.72 0 5.49-10.26 3.53-14.11 5.05-25 3.1-4.45-.8-5.67-4.36-5.67-8.59"
          stroke="rgba(238, 236, 164, 1)"
        />
        <Path
          d="M170.63 75c0-5.66-.42-12.27 4.37-12.5 9.9-.47 12.34 6.05 25 11.11 2.96 1.19 6.25.46 6.25 1.39 0 .97-2.95 2.03-6.25 2.42-12.33 1.47-13.05 2.28-25 1.3-2.74-.23-4.37-1.27-4.37-3.72"
          stroke="rgba(104, 96, 164, 1)"
        />
        <Path
          d="M321.08 75c0-2.15 1.17-3.66 3.92-4.45 11.71-3.37 14.16-5.49 25-3.88 4.16.62 5 4.92 5 8.33 0 1.94-2.29 2.02-5 2.36-12.29 1.55-13.12 2.39-25 1.42-2.58-.21-3.92-1.81-3.92-3.78"
          stroke="rgba(124, 121, 135, 1)"
        />
        <Path
          d="M395 75c0-1.68 2.64-2.66 5-2.66 1.71 0 3.13 1.1 3.13 2.66 0 2.18-1.29 4.81-3.13 4.81-2.22 0-5-2.75-5-4.81"
          stroke="rgba(104, 96, 164, 1)"
        />
      </G>
      <Defs>
        <Mask id="SvgjsMask1003">
          <Path fill="#fff" d="M0 0H600V100H0z" />
        </Mask>
      </Defs>
    </Svg>
  );
}

const useStyles = makeStyles((theme) => ({
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mainContainer: {
    padding: theme.spacing.xl,
  },
  formControl: {
    marginTop: theme.spacing.xl,
  },
  stepBottomContainer: {
    marginTop: theme.spacing.xl,
    flexDirection: "row",
    alignItems: "center",
  },
  nextButton: {
    marginLeft: "auto",
  },
  pickerItem: {
    fontFamily: "SoraRegular",
  },
  stepTitle: {
    fontFamily: "SoraBold",
    fontSize: 20,
    marginBottom: theme.spacing.md,
  },
  stepDescription: {
    color: theme.colors.grey0,
    marginBottom: theme.spacing.xl,
  },
  shapesContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -10,
  },
}));
