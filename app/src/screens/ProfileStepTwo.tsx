import { yupResolver } from "@hookform/resolvers/yup";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Icon, makeStyles, Text } from "@rneui/themed";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, TouchableOpacity, View } from "react-native";
import * as yup from "yup";
import { Picker as RNPicker } from "@react-native-picker/picker";
import { Picker } from "~/components/Picker";
import { useProfileQuery } from "~/hooks/useProfileQuery";
import { useProfileStepTwoMutation } from "~/hooks/useProfileStepTwoMutation";
import { TrainingActivity, UncompletedProfileStackParamList } from "~/typings";
import { formatDecimal } from "~/utils/formatDecimal";
import { getRecommendedWeeklyWeightChange } from "~/utils/getRecommendedWeeklyWeightChange";
import { Input } from "~/components/Input";
import { Button } from "~/components/Button";
import { Defs, G, Mask, Path, Svg } from "react-native-svg";
import { useTheme } from "@rneui/themed";
import { ProfileStepIndicator } from "~/components/ProfileStepIndicator";

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

export type Schema = yup.TypeOf<typeof schema>;

type Props = NativeStackScreenProps<
  UncompletedProfileStackParamList,
  "StepTwo"
>;

export function ProfileStepTwoScreen({ navigation }: Props) {
  const { data: profile } = useProfileQuery();
  const userTrains =
    profile?.trainingActivity &&
    profile.trainingActivity.toString() !==
      TrainingActivity.ZeroWeeklySessions.toString();
  const {
    watch,
    control,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm<Schema>({
    resolver: yupResolver(schema),
    defaultValues: {
      goal: userTrains ? "build-muscle" : "maintain",
      approach: "bulk",
    },
  });

  const [goal, approach] = watch(["goal", "approach"]);

  useEffect(() => {
    const { kgs: recommendedWeeklyKgsChange, lbs: recommendedWeeklyLbsChange } =
      getRecommendedWeeklyWeightChange(approach, profile!);

    setValue(
      "weeklyWeightChange",
      // @ts-expect-error because the schema says it's a number and not a string
      profile?.prefered_measurement_system === "imperial"
        ? formatDecimal(recommendedWeeklyLbsChange).toString()
        : formatDecimal(recommendedWeeklyKgsChange).toString()
    );
  }, [profile, approach, setValue]);

  useEffect(() => {
    if (goal === "build-muscle") {
      setValue("approach", "bulk");
    } else if (goal === "lose-fat") {
      setValue("approach", "cut");
    } else if (goal === "maintain") {
      setValue("approach", "maintain");
    }
  }, [goal, setValue]);

  const mutation = useProfileStepTwoMutation({ profile: profile!, navigation });
  const { theme } = useTheme();

  const goNext = (values: Schema) => {
    mutation.mutate({
      approach: values.approach,
      goal: values.goal,
      weeklyWeightChange: values.weeklyWeightChange!,
    });
  };

  const goBack = () => {
    navigation.navigate("StepOne");
  };

  const styles = useStyles();

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.shapesContainer}>
        <Shapes />
      </View>

      <View style={styles.mainContainer}>
        <TouchableOpacity onPress={goBack}>
          <Icon
            name="back"
            type="antdesign"
            size={30}
            style={styles.goBack}
            color={theme.colors.grey0}
          />
        </TouchableOpacity>

        <Text style={styles.stepTitle}>Goal & Strategy</Text>
        <Text style={styles.stepDescription}>
          Tell us more about your goal so we can set you up with the perfect
          nutrition strategy to help you achieve it.
        </Text>

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
          {/* If the user trains, then we show them a build muscle option */}
          {userTrains ? (
            <RNPicker.Item
              label="Build muscle"
              value="build-muscle"
              style={styles.pickerItem}
            />
          ) : null}
          <RNPicker.Item
            label="Lose fat"
            value="lose-fat"
            style={styles.pickerItem}
          />
          <RNPicker.Item
            label="Maintain"
            value="maintain"
            style={styles.pickerItem}
          />
        </Picker>

        <View style={styles.formControl}>
          <Picker
            value={
              approach === "bulk"
                ? "Bulk (caloric surplus)"
                : approach === "cut"
                ? "Cut (caloric deficit)"
                : "Caloric maintenance"
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
                style={styles.pickerItem}
              />
            ) : approach === "cut" ? (
              <RNPicker.Item
                label="Cut (caloric deficit)"
                value="cut"
                style={styles.pickerItem}
              />
            ) : (
              <RNPicker.Item
                label="Maintain (caloric maintenance)"
                value="maintain"
                style={styles.pickerItem}
              />
            )}
          </Picker>
        </View>

        <View style={styles.formControl}>
          <Input
            control={control}
            editable={false}
            label="Weekly weight change goal"
            name="weeklyWeightChange"
            keyboardType="numeric"
            helperText="This is the recommended weekly weight change goal and is only editable in the strategy's settings once started."
            suffix={
              profile?.preferedMeasurementSystem === "imperial" ? "lbs" : "kgs"
            }
            errorMessage={errors.weeklyWeightChange?.message?.toString()}
          />
        </View>

        <View style={styles.stepBottomContainer}>
          <ProfileStepIndicator currentStepNumber={2} />

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

const useStyles = makeStyles((theme) => ({
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mainContainer: {
    padding: theme.spacing.xl,
  },
  shapesContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -10,
  },
  stepBottomContainer: {
    marginTop: theme.spacing.xl,
    flexDirection: "row",
    alignItems: "center",
  },
  nextButton: {
    marginLeft: "auto",
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
  pickerItem: {
    fontFamily: "SoraRegular",
  },
  formControl: {
    marginTop: theme.spacing.xl,
  },
  goBack: {
    alignSelf: "flex-start",
    marginBottom: theme.spacing.lg,
  },
  goToAppButton: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: 100,
    alignSelf: "center",
  },
}));

function Shapes() {
  return (
    <Svg
      width={600}
      height={100}
      preserveAspectRatio="none"
      viewBox="0 0 600 100"
    >
      <G mask='url("#SvgjsMask1006")' fill="none" strokeWidth={2}>
        <Path
          d="M100 19.83c-3.52 0-6.34 2.15-6.34 5.17 0 4.06 2.47 9 6.34 9 5.22 0 11.84-5.21 11.84-9 0-3.29-6.27-5.17-11.84-5.17M250 22.66c-2.28 0-5 .98-5 2.34 0 1.48 2.84 3.33 5 3.33 1.44 0 2.21-1.76 2.21-3.33 0-1.26-.88-2.34-2.21-2.34"
          stroke="rgba(104, 96, 164, 1)"
        />
        <Path
          d="M300 23.47c-.93.11-1 .59-1.15 1.53-1.94 12.33-2.08 12.46-3.02 25-.93 12.46-2.33 13.23-.72 25 .47 3.44 1.77 5.42 4.89 5.42 6.82 0 14.31.18 15-5.42 1.19-9.61-13.58-13.85-11.23-25 2.65-12.58 9.21-13.8 21.23-22.46 5.33-3.84 13.46-1.17 13.46-2.54 0-1.38-6.63-2.7-13.46-2.97-12.4-.49-12.85.06-25 1.44M500 15c-5.18 1.13-6.87 4.8-6.87 10 0 6.35 2.44 7.29 6.87 13.1 5.1 6.69 5.44 6.86 12.2 11.9 5.74 4.28 5.88 5.31 12.8 6.73 11.98 2.46 13.6 3.35 25 1.02 5.03-1.03 7.86-2.9 7.86-7.75 0-11.52-3.93-12.5-7.86-25 0 0 0 0 0 0-12.5-3.49-12.31-4.44-25-6.98-12.31-2.46-14.25-5.38-25-3.02M125 45.83c-2.31.59-2.78 1.93-2.78 4.17 0 3.42-.48 6.43 2.78 7.14 10.63 2.3 13.5 1.57 25-1.12 3.74-.88 5.49-2.89 5.49-6.02 0-3.45-1.47-6.59-5.49-7.14-11.23-1.54-13.42-.01-25 2.97M75 64.19c-7.23 0-16.67 6.61-16.67 10.81 0 3.68 8.72 4.94 16.67 4.94 4.02 0 7.27-1.77 7.27-4.94 0-4.7-2.53-10.81-7.27-10.81M450 71.3c-1.79.73-1.61 1.94-1.61 3.7 0 1.18.56 1.33 1.61 2.17 12.25 9.78 15.66 19.71 25 19.08 6.64-.45 6.97-11.07 6.97-21.25 0-5.89-1.66-10.29-6.97-10.9-10.68-1.24-13.48 2.48-25 7.2"
          stroke="rgba(124, 121, 135, 1)"
        />
        <Path
          d="M8.71 25C8.02 14.41 3.63 14.88 0 4.46-.73 2.38-1.14 1.09 0 0c1.18-1.14 2.46-.73 4.63 0C14.96 3.5 14.59 4.87 25 8.46c12.27 4.23 14.37 9.55 25 7.17C58.25 13.78 54.98 4.86 62.76 0 67.48-2.95 68.88 0 75 0h50c4.17 0 4.34-.97 8.33 0 8.51 2.06 9.34 6.06 16.67 6.06 3 0 .79-5.28 4-6.06 9.29-2.25 10.5 0 21 0h25c3.92 0 7.84-2.4 7.84 0 0 5.29-3.71 7.81-7.84 15.38-2.69 4.93-5.81 5.23-5.81 9.62 0 3.08 3.19 2.39 5.81 5.32 8.55 9.57 16.52 10.38 16.52 19.68 0 8.12-8.23 7.61-16.52 15.16-5.43 4.95-7.6 3.56-10.91 9.84-5.88 11.14-1.85 15.03-7.47 25-1.43 2.53-3.31 0-6.62 0h-25c-3.89 0-5.77 2.8-7.78 0-6.95-9.7-12.32-14.81-10.14-25 1.71-8.03 9.79-4.74 17.92-11.45 7.01-5.79 12.36-6.52 12.36-13.55 0-7.78-4.52-10.17-12.36-16.07-8.76-6.6-13.21-1.97-20.83-8.93-4.88-4.45 1.18-11.62-4.17-13.89-9.24-3.91-13.73-2.37-25 1.53-8.8 3.04-9.53 4.68-15.14 12.36-6.89 9.44-1.5 18.35-9.86 21.88-9.07 3.83-13.85-8.19-25-7.17-5.87.54-7.75 4.05-9.05 10.29-2.37 11.41-1.46 13.53 1.72 25 1.34 4.83 2.6 5.74 7.33 7.59 11.43 4.47 13.41 7.08 25 5.06C85.23 85.87 91.56 83.6 93.64 75c2.47-10.22-11.53-16.14-9.55-25 1.2-5.39 8.32-3.5 15.91-3.5 2.79 0 3.73.83 4.86 3.5 4.91 11.58 5.48 12.25 7.21 25 1.66 12.25 3.69 16.47-.43 25-1.92 3.97-5.82 0-11.64 0H25c-12.5 0-18.42 5.92-25 0-5.92-5.33-.52-11.36 0-22.5.06-1.36 1.01-1.14 1.16-2.5 1.34-12.39-.05-12.64 1.82-25 1.91-12.64 6.53-12.82 5.73-25M250 12.89c-5.93 0-12.13-9.07-12.13-12.89 0-2.62 6.07 0 12.13 0 5.57 0 11.15-2.55 11.15 0 0 3.9-5.44 12.89-11.15 12.89"
          stroke="rgba(124, 121, 135, 1)"
        />
        <Path
          d="M300 10.71c-5.91-2.02-8.47-7.41-8.47-10.71 0-2.05 4.23 0 8.47 0h25c6.49 0 12.98-2.45 12.98 0 0 3.27-5.21 9.25-12.98 11.44-11.22 3.17-14.17 2.97-25-.73"
          stroke="rgba(238, 236, 164, 1)"
        />
        <Path
          d="M365.32 25c6.11-4.98 4.08-7.24 9.68-13.04 6.47-6.7 6.46-8.13 14.47-11.96 4.49-2.15 5.27 0 10.53 0h25c4.16 0 4.4-1.12 8.33 0 8.57 2.45 7.93 5.16 16.67 7.14 12.1 2.74 14.88-2.83 25 2.29 7.53 3.81 10.31 7.37 10.31 15.57 0 11.04-1.46 16.95-10.31 22.92-8.81 5.94-12.65-.06-25 .89-1.15.09-1.53.14-2 1.19-5.38 12.05-10.27 13.23-9.69 25 .42 8.61 5.15 8.53 11.69 15.76 4.76 5.27 10.9 6.62 10.9 9.24 0 2-5.45 0-10.9 0-7.33 0-7.86 1.81-14.66 0-5.7-1.52-4.67-4.44-10.34-6.67-12-4.72-13.83-9.1-25-7.22-8.68 1.46-6.42 9.29-14.71 13.89-4.21 2.34-5.15 0-10.29 0h-25c-7.85 0-15.7 3.31-15.7 0 0-4.73 7.37-8.58 15.7-16.07 5.57-5.01 12.1-4.97 12.1-8.93 0-3.58-5.57-5.01-12.1-6.15-12.02-2.11-15.07 4.62-25-.35-8.91-4.46-12.67-9.75-12.67-18.5 0-7.2 4.74-9.69 12.67-13.41 10.9-5.12 12.92-.81 25-4.28 8.08-2.32 8.93-2.11 15.32-7.31"
          stroke="rgba(104, 96, 164, 1)"
        />
        <Path
          d="M500 3.64c-3.79-1.27-7.14-2.68-7.14-3.64 0-.86 3.57 0 7.14 0h25c9.44 0 18.88-2.5 18.88 0 0 2.88-8.89 9.93-18.88 10.76-11.95.99-12.72-3.01-25-7.12"
          stroke="rgba(238, 236, 164, 1)"
        />
        <Path
          d="M375 38.04c-4.95.83-4.82 6.05-4.82 11.96 0 5.17.23 9.23 4.82 10.19 10.32 2.16 13.39-.18 25-3.94 4.12-1.33 6.45-3.3 6.45-6.25 0-2.68-2.69-3.57-6.45-5-11.96-4.55-15.04-8.63-25-6.96"
          stroke="rgba(124, 121, 135, 1)"
        />
        <Path
          d="M566.79 50c0-9.79 3.21-19.83 8.21-19.83 5.5 0 12.78 10.15 12.78 19.83 0 8.69-7.22 16.91-12.78 16.91-4.93 0-8.21-8.33-8.21-16.91M492.21 75c3.76-9.95.53-17.52 7.79-19.79 9.13-2.86 12.09 6.6 25 9.53 12.09 2.74 13.04-1.1 25 1.81 9.11 2.22 13.95 1.22 17.14 8.45 4.19 9.5 3.03 17.13-2.37 25-3.17 4.63-7.39 0-14.77 0h-50c-8.46 0-15.4 4.86-16.91 0-2.38-7.64 4.42-12.55 9.12-25"
          stroke="rgba(238, 236, 164, 1)"
        />
        <Path
          d="M586.84 100c0-1.1 8.14-4.31 13.16-4.31 1.56 0 1.62 3.78 0 4.31-4.96 1.62-13.16 1.05-13.16 0M18.18 25c1-4.47 2.44-6.71 6.82-6.92 11.53-.57 14.89 9.5 25 5.36C61.96 18.54 58.66 9.82 69.13 0c2.03-1.9 2.93 0 5.87 0h25c5.94 0 11.87-1.3 11.87 0 0 1.43-6.55 1.75-11.87 5.46C87.42 14.25 87.6 14.9 76.06 25c-.96.84.15 2.23-1.06 2.34-11.82 1.11-14.82-5.04-25 .11C37.77 33.63 35.1 37.04 30.17 50c-4.12 10.82-3.13 14.28 1.73 25 5.05 11.15 7.11 13.56 18.1 18.75 10.56 4.99 12.49 1.02 25 1.62 12.49.6 13.83-1.22 25 .78 1.76.32.86 2.27.86 3.85 0 .34-.43 0-.86 0H25c-8.34 0-14.86 4.88-16.67 0-2.84-7.62 4.94-12.26 7.37-25 2.34-12.26 1.54-12.48 2.16-25 .62-12.48-2.25-13.51.32-25M150 25c-.66-12.18 6.76-15.26 16.5-25 2.76-2.76 4.25 0 8.5 0 8.18 0 15.49-4.65 16.35 0 1.46 7.85-13.86 14.09-11.7 25 2.16 10.9 10.48 9.02 20.35 18.62 2.98 2.9 5.36 3.36 5.36 6.38 0 2.63-2.66 2.48-5.36 4.92-11.12 10.06-12.23 9.28-22.27 20.08-2.46 2.65.33 5.32-2.73 6.82-10.8 5.27-15.11 8.89-25 6.72-5.68-1.24-6.13-7.68-6.13-13.54 0-2.87 3.55-1.38 6.13-3.92 10.1-9.96 19.23-10.14 19.23-21.08 0-12.1-18.53-12.18-19.23-25M250 3.12c-1.44 0-2.94-2.19-2.94-3.12 0-.63 1.47 0 2.94 0 1.35 0 2.7-.62 2.7 0 0 .94-1.32 3.12-2.7 3.12M270.59 25c.74-2.72 2.18-3.85 4.41-3.85 2.29 0 4.44 1.07 4.62 3.85.76 11.64-3.2 12.57-2.73 25 .48 12.57 5.2 12.82 4.63 25-.37 8.01-.51 14.46-6.52 15.38-9.75 1.5-13.37-4.21-25-10.54-2.5-1.36-3.26-2.22-3.26-4.84 0-4.21.35-5.26 3.26-8.82 7.31-8.94 12.21-6.23 17.19-16.18 5.32-10.64.23-13.29 3.4-25"
          stroke="rgba(104, 96, 164, 1)"
        />
        <Path
          d="M325 .85c-4.03 0-8.33-.64-8.33-.85 0-.21 4.17 0 8.33 0 .48 0 .96-.18.96 0 0 .24-.34.85-.96.85M391.25 25c0-3.14 4.54-7.29 8.75-7.29 3.81 0 7.29 4.09 7.29 7.29 0 2.64-3.56 4.38-7.29 4.38-4.29 0-8.75-1.68-8.75-4.38M438.28 25c0-3.74 5.31-6.04 11.72-6.7 11.95-1.23 13.34.09 25 2.93 2.09.51 2.5 1.78 2.5 3.77 0 2.68.18 4.69-2.5 5.56-11.07 3.6-13.41 5.12-25 3.37-6.77-1.03-11.72-4.85-11.72-8.93M525 3.49c-5 0-10.34-2.59-10.34-3.49 0-.85 5.17 0 10.34 0 3.06 0 6.12-.81 6.12 0 0 .93-2.89 3.49-6.12 3.49"
          stroke="rgba(238, 236, 164, 1)"
        />
        <Path
          d="M320.89 50c0-2.34 1.32-3.58 4.11-4.35 11.77-3.27 13.48-5.19 25-3.73 5.58.71 9.21 3.97 9.21 8.08 0 4.23-3.5 7.61-9.21 8.61-11.39 2-13.71.73-25-2.61-3.27-.97-4.11-3.16-4.11-6"
          stroke="rgba(124, 121, 135, 1)"
        />
        <Path
          d="M402.78 75c0-6.95 14.64-20 22.22-20 5.14 0 3.23 10.39 3.23 20 0 2.61-.75 4.44-3.23 4.44-10.24 0-22.22.83-22.22-4.44M511.54 75c6.45-2.01 6.69-2.24 13.46-2.24 10.9 0 21.88-.41 21.88 2.24 0 2.84-13.15 1.81-21.88 8.75-6.99 5.56-2.69 11.78-9.56 16.25-5.63 3.66-7.72 0-15.44 0-3.86 0-7.72 2.62-7.72 0 0-7.1 1.75-11.69 7.72-19.44 3.66-4.75 5.49-3.67 11.54-5.56"
          stroke="rgba(238, 236, 164, 1)"
        />
        <Path
          d="M217.36 100c0-2.68 3.35-8.87 7.64-8.87 5.38 0 11.7 6.4 11.7 8.87 0 1.97-5.85 0-11.7 0-3.82 0-7.64 1.75-7.64 0"
          stroke="rgba(124, 121, 135, 1)"
        />
        <Path
          d="M287.5 100c0-1.16 6.53-4.52 12.5-4.52 3.63 0 6.7 3.28 6.7 4.52 0 1.02-3.35 0-6.7 0-6.25 0-12.5 1.1-12.5 0"
          stroke="rgba(238, 236, 164, 1)"
        />
        <Path
          d="M348.84 100c0-.35.38-1.19 1.16-1.19 3.96 0 8.33.89 8.33 1.19 0 .3-4.17 0-8.33 0-.58 0-1.16.24-1.16 0"
          stroke="rgba(124, 121, 135, 1)"
        />
      </G>
      <Defs>
        <Mask id="SvgjsMask1006">
          <Path fill="#fff" d="M0 0H600V100H0z" />
        </Mask>
      </Defs>
    </Svg>
  );
}
