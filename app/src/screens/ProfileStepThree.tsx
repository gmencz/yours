import { yupResolver } from "@hookform/resolvers/yup";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Icon, makeStyles, Text, useTheme } from "@rneui/themed";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Defs, G, Mask, Path, Svg } from "react-native-svg";
import * as yup from "yup";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { ProfileStepIndicator } from "~/components/ProfileStepIndicator";
import { useProfileQuery } from "~/hooks/useProfileQuery";
import { useProfileStepThreeMutation } from "~/hooks/useProfileStepThreeMutation";
import { UncompletedProfileStackParamList } from "~/typings";
import { estimateTdee } from "~/utils/estimateTdee";

const schema = yup
  .object({
    tdee: yup
      .number()
      .typeError("Energy expenditure is required")
      .required("Energy expenditure is required"),
  })
  .required();

type Schema = yup.TypeOf<typeof schema>;

type Props = NativeStackScreenProps<
  UncompletedProfileStackParamList,
  "StepThree"
>;

export function ProfileStepThreeScreen({ navigation }: Props) {
  const styles = useStyles();
  const { data: profile } = useProfileQuery();
  const { theme } = useTheme();

  const estimatedTdee = useMemo(
    () =>
      estimateTdee({
        activity: profile!.activity!,
        age: profile!.age!,
        height: profile!.height!,
        preferedMeasurementSystem: profile!.preferedMeasurementSystem!,
        sex: profile!.sex!,
        trainingActivity: profile!.trainingActivity!,
        weight: profile!.initialWeight!,
      }),
    [profile]
  );

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Schema>({
    resolver: yupResolver(schema),
    defaultValues: {
      // @ts-expect-error because schema says it's a number
      tdee: estimatedTdee.toString(),
    },
  });

  const mutation = useProfileStepThreeMutation({ profile: profile! });

  const goBack = () => {
    navigation.navigate("StepTwo");
  };

  const letsGo = ({ tdee }: Schema) => {
    mutation.mutate({
      tdee: tdee!,
    });
  };

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

        <Text style={styles.stepTitle}>Energy expenditure</Text>
        <Text style={styles.stepDescription}>
          Based on your data, we estimate that you expend around {estimatedTdee}{" "}
          calories. If you know better, feel free to update it below.
        </Text>

        <Input
          label="Daily energy expenditure"
          control={control}
          name="tdee"
          suffix="kcal"
          errorMessage={errors.tdee?.message}
          placeholder="Enter your expenditure"
          keyboardType="numeric"
          helperText="This is just a starting point. As you use the app, it will adapt to your metabolism and life and figure out exactly what your expenditure is."
        />

        <View style={styles.stepBottomContainer}>
          <ProfileStepIndicator currentStepNumber={3} />

          <Button
            style={styles.letsGoButton}
            title="Let's go!"
            onPress={handleSubmit(letsGo)}
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
  letsGoButton: {
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
      <G mask='url("#SvgjsMask1007")' fill="none" strokeWidth={2}>
        <Path
          d="M25 23.53c-.59 0-1.25.82-1.25 1.47 0 .5.65.82 1.25.82.52 0 1-.34 1-.82 0-.66-.46-1.47-1-1.47"
          stroke="rgba(124, 121, 135, 1)"
        />
        <Path
          d="M250 22.81c-2.2 0-3.98.65-3.98 2.19 0 2.29 1.09 5.47 3.98 5.47 7.85 0 17.5-3.52 17.5-5.47 0-1.88-8.96-2.19-17.5-2.19M550 18.75c-3.93 0-9.48 3.56-9.48 6.25 0 2.43 5.23 3.99 9.48 3.99 2.13 0 3.27-1.83 3.27-3.99 0-2.96-.83-6.25-3.27-6.25"
          stroke="rgba(104, 96, 164, 1)"
        />
        <Path
          d="M50 43.18c-2.9 0-5.84 3.5-5.84 6.82 0 3.09 2.94 6 5.84 6 2.87 0 5.7-2.91 5.7-6 0-3.32-2.83-6.82-5.7-6.82"
          stroke="rgba(124, 121, 135, 1)"
        />
        <Path
          d="M225 40.42c-7.13 0-14.74 5.34-14.74 9.58 0 3.9 7.51 6.69 14.74 6.69 6.13 0 11.98-2.85 11.98-6.69 0-4.29-5.75-9.58-11.98-9.58M400 47.79c-9.39.98-9.81-.07-18.75 2.21-3.56.91-4.68.95-6.25 4.17-4.53 9.28-5.95 11.99-5.95 20.83 0 2.55 2.89 1.34 5.95 1.95 12.41 2.47 13.13 4.91 25 4.22 5.02-.29 5.37-2.11 8.77-6.17 9.1-10.88 7.75-12.26 16.23-23.72.77-1.04 2.27-.29 2.27-1.28 0-1.93.03-4.36-2.27-4.55-11.34-.92-12.51 1.04-25 2.34"
          stroke="rgba(104, 96, 164, 1)"
        />
        <Path
          d="M475 47.76c-3.03 0-5.77 1.03-5.77 2.24 0 1.25 2.69 2.68 5.77 2.68 9.18 0 18.75-1.45 18.75-2.68 0-1.23-9.52-2.24-18.75-2.24"
          stroke="rgba(124, 121, 135, 1)"
        />
        <Path
          d="M125 68.29c-3.4 0-7.43 3.84-7.43 6.71 0 2.39 3.88 3.82 7.43 3.82 2.71 0 5.09-1.55 5.09-3.82 0-3-2.23-6.71-5.09-6.71M300 68.91c-6.76 0-13.19 2.74-13.19 6.09 0 3.52 6.35 7.66 13.19 7.66 8.89 0 18.27-4.17 18.27-7.66 0-3.39-9.3-6.09-18.27-6.09"
          stroke="rgba(104, 96, 164, 1)"
        />
        <Path
          d="M25 5.15C17.1 5.15 8.13 16.29 8.13 25c0 6.75 9.45 4.42 16.87 11.07 6.54 5.85 5.16 7.28 11.04 13.93 6.62 7.48 7.03 14.33 13.96 14.33 6.85 0 7.24-6.8 13.61-14.33 6.13-7.26 4.62-8.77 11.39-15.25 6.29-6.02 12.24-2.58 14.74-9.75 3.56-10.2-6.01-16.73-2.62-25 1.74-4.23 6.44 0 12.88 0 6.54 0 10-4.24 13.08 0 6.01 8.26 1.37 12.91 5.1 25 2.23 7.23 1.22 13.48 6.82 13.64 10.31.29 12.68-6.18 25-12.75.47-.25.58-.46.58-.89 0-.37-.36-.31-.58-.71-6.61-12.1-13.08-16.05-13.08-24.29 0-3.91 6.54 0 13.08 0h25c3.13 0 4.2-2.1 6.25 0 10.16 10.4 15.35 11.46 18.17 25 2.39 11.46-6.02 12.22-7.75 25-1.65 12.22 5.21 14.43.98 25-4.1 10.26-7.61 10.25-17.65 16.67-9.5 6.08-10.61 4.72-21.43 8.33-1.68.56-1.79 0-3.57 0h-50c-9.16 0-9.5 1.31-18.33 0-3.67-.54-3-2.82-6.67-3.7-12.17-2.92-12.48-3.74-25-3.91-12.48-.17-14.56 7.32-25 3.22C13.31 91.02 10.53 87.08 5.74 75c-4.25-10.72 3-13.06 1.17-25C5.87 43.19 1.84 44.17 0 37.5c-1.61-5.83 0-6.25 0-12.5C0 12.5-6.25 6.25 0 0s12.5 0 25 0h25c5.84 0 9.68-3.98 11.67 0 4.26 8.52 4.46 14.53.83 25-2.21 6.38-6.34 8.71-12.5 8.71-5.84 0-6.81-3.35-11.5-8.71C30.69 16.08 32.28 5.15 25 5.15"
          stroke="rgba(238, 236, 164, 1)"
        />
        <Path
          d="M201.92 25c0-2.73 12.23-5.88 23.08-5.88 4.1 0 6.82 3.07 6.82 5.88 0 2.63-2.88 5-6.82 5-11.01 0-23.08-2.29-23.08-5"
          stroke="rgba(124, 121, 135, 1)"
        />
        <Path
          d="M250 15c-6.87 0-13.79-10.53-13.79-15 0-3.03 6.9 0 13.79 0 6.82 0 13.64-3.02 13.64 0 0 4.48-6.8 15-13.64 15"
          stroke="rgba(104, 96, 164, 1)"
        />
        <Path
          d="M314.29 25c2.68-10.98-7.94-17.2-4.6-25 2.01-4.7 7.66 0 15.31 0 5.13 0 7.94-3.57 10.27 0 5.85 8.93 8.78 14.08 6.09 25-2.44 9.91-8.1 8.41-16.36 16.67-4.25 4.24-3.91 4.68-8.65 8.33-7.76 5.97-7.72 10.9-16.35 10.9-11.69 0-24.29-5.56-24.29-10.9 0-5.3 13.42-3.33 24.29-10.37 8.42-5.46 12.13-5.8 14.29-14.63M359.9 25c-2.15-10.86 1.6-15.34 7.44-25 1.71-2.84 3.83 0 7.66 0 6.99 0 8.98-3.57 13.97 0 7.51 5.36 6.49 17.86 11.03 17.86 4.1 0-.03-13.37 6.25-17.86 6.22-4.44 9.38 0 18.75 0 7.6 0 8.58-2.46 15.2 0 5.88 2.19 3.73 7.08 9.8 9.29 11.33 4.13 12.44 2.57 25 3.38 12.44.8 15.12-4.15 25-.17 5.4 2.18 5.56 7.44 5.56 12.5 0 2.19-2.86.81-5.56 2-12.58 5.53-12.31 6.18-25 11.43-12.31 5.09-14.59 12.45-25 9.26-11.52-3.53-9.27-11.48-18.85-22.69-2.92-3.42-2.29-6.56-6.15-6.56-8.3 0-9.38 2.7-18.18 6.56-3.7 1.62-3.11 2.81-6.82 4.41-12.2 5.24-13.63 10.52-25 9.27-8.68-.96-13.42-5.2-15.1-13.68"
          stroke="rgba(124, 121, 135, 1)"
        />
        <Path
          d="M550 4.55c-2.49 0-4.55-3.22-4.55-4.55 0-.94 2.27 0 4.55 0 3.34 0 6.67-1.03 6.67 0 0 1.25-3.55 4.55-6.67 4.55M560.71 25c7.12-8.59 6.13-9.77 14.29-17.14 5.69-5.13 6.25-5.61 13.41-7.86 5.34-1.68 9.75-3.96 11.59 0 3.96 8.54 0 12.5 0 25 0 6.52 2.36 7.4 0 13.03-2.88 6.87-10.49 5.95-10.49 11.97 0 6.12 7.55 5.31 10.49 12.32 2.3 5.49 0 6.34 0 12.68 0 12.5 4.22 16.72 0 25-2.15 4.22-7.01 1.99-12.75 0-6.76-2.35-6.35-8.68-12.25-8.68-5.18 0-4.09 6.66-9.92 8.68-6.67 2.32-7.54 0-15.08 0-5.46 0-10.92 3.32-10.92 0 0-7.23 5.08-10.81 10.92-21.11 1.24-2.2 3.24-1.9 3.24-3.89 0-2.14-1.12-4.37-3.24-4.37-3.67 0-3.97 2.64-8.33 4.37-8.14 3.23-10.25.23-16.67 5.56-8.64 7.17-5.06 12.91-13.46 19.44-4.1 3.19-5.77 0-11.54 0-7.19 0-8.73 3.13-14.38 0-6.85-3.79-5.04-7.15-10.62-13.84-4.85-5.81-10.25-5.58-10.25-11.16s4.01-11.16 10.25-11.16c10.91 0 12.05 5.53 24.04 11.16.51.24.45.58.96.58.8 0 .94-.08 1.67-.58 11.77-8.12 12.9-7.26 23.33-16.67 3.42-3.09.84-5.46 4.38-8.33 8.96-7.27 11.45-4.64 20.62-11.96 6.49-5.18 5.33-6.54 10.71-13.04"
          stroke="rgba(238, 236, 164, 1)"
        />
        <Path
          d="M125 53.05c-11.13 0-24.32 12.56-24.32 21.95 0 7.84 12.69 12.5 24.32 12.5 8.86 0 16.67-5.08 16.67-12.5 0-9.81-7.31-21.95-16.67-21.95"
          stroke="rgba(124, 121, 135, 1)"
        />
        <Path
          d="M202.91 75c.44-7.84 11.24-11.05 22.09-11.05 9.51 0 18.03 3.43 18.63 11.05.83 10.4-7.28 13.6-15.77 25-.82 1.1-1.43 0-2.86 0-1 0-1.35.73-2 0-10.4-11.77-20.65-14.82-20.09-25"
          stroke="rgba(104, 96, 164, 1)"
        />
        <Path
          d="M419.74 75c3.48-3 2.47-7.69 5.26-7.69 2.97 0 6.16 3.13 6.25 7.69.23 11.79-2.56 12.8-5.61 25-.08.3-.32 0-.64 0h-50c-7.21 0-14.41 2.81-14.41 0 0-3.83 5.77-10.84 14.41-13.28 11.06-3.12 13.6 5.16 25 2.17 10.97-2.87 10.72-6.1 19.74-13.89M287.84 100c0-1.95 5.64-4.63 12.16-7.26 12.06-4.87 14.2-9.8 25-7.74 8.19 1.57 12.98 10.47 12.98 15 0 2.97-6.49 0-12.98 0h-25c-6.08 0-12.16 1.68-12.16 0M50 15c-1.22 0-3.57-8.91-3.57-15 0-1.41 1.79 0 3.57 0 .63 0 1.25-.58 1.25 0 0 6.92-.06 15-1.25 15M100 12.5c-1.72 0-3.41-7.55-3.41-12.5 0-1.3 1.71 0 3.41 0 1.73 0 3.46-1.32 3.46 0 0 4.93-1.74 12.5-3.46 12.5"
          stroke="rgba(124, 121, 135, 1)"
        />
        <Path
          d="M150 6.43c-2.36 0-3.46-4.25-3.46-6.43 0-1.03 1.73 0 3.46 0 3.88 0 7.76-1.4 7.76 0 0 1.82-4.51 6.43-7.76 6.43M165.12 25c0-6.24 4.94-11.49 9.88-11.49s9.88 5.25 9.88 11.49c0 8.36-4.94 17.71-9.88 17.71s-9.88-9.35-9.88-17.71M250 7.19c-3.29 0-6.61-5.05-6.61-7.19 0-1.45 3.3 0 6.61 0 3.26 0 6.53-1.45 6.53 0 0 2.15-3.25 7.19-6.53 7.19"
          stroke="rgba(104, 96, 164, 1)"
        />
        <Path
          d="M321.73 25c-1.03-12.11-.76-13.66.72-25 .15-1.16 1.28 0 2.55 0 .86 0 1.55-.79 1.71 0 2.34 11.71 3.96 13.27 3.29 25-.19 3.32-2.76 5.09-5 5.09-1.9 0-3.02-2.16-3.27-5.09M372.92 25c0-4.66.53-10 2.08-10 1.66 0 4.35 5.86 4.35 10 0 1.8-2.33 1.89-4.35 1.89-1.2 0-2.08-.61-2.08-1.89M425 8.2c-3.95 0-8.33-5.81-8.33-8.2 0-1.71 4.17 0 8.33 0 3.38 0 6.76-1.59 6.76 0 0 2.51-3.17 8.2-6.76 8.2"
          stroke="rgba(238, 236, 164, 1)"
        />
        <Path
          d="M440.77 25c0-4.27 3.72-7.08 9.23-7.69 11.61-1.28 12.77 1.08 25 3.92 4.31 1 8.09 1.82 8.09 3.77 0 1.98-3.81 2.66-8.09 4.1-12.26 4.12-14 8.33-25 7.01-6.12-.73-9.23-5.98-9.23-11.11M568.15 25c3.4-4.12 2.26-5.81 6.85-8.21 11.33-5.93 17.34-10.98 25-8.46 4.84 1.59 0 8.33 0 16.67 0 2.12 1.21 2.57 0 4.23-7.9 10.84-18.21 10.32-18.21 20.77 0 10.62 10.14 10.31 18.21 21.38 1.04 1.43 0 1.81 0 3.62 0 12.5.24 12.74 0 25 0 .24-.29.14-.49 0-12.3-8.54-12.33-8.58-24.51-17.36-5.17-3.72-5.96-2.96-10.19-7.64-8.27-9.14-7.1-10.27-14.81-20-2.19-2.77-5-2.83-5-5 0-1.78 3.05-.8 5-2.9 9.63-10.4 9.05-11.07 18.15-22.1"
          stroke="rgba(124, 121, 135, 1)"
        />
        <Path
          d="M20.21 50c.87-2.76 2.62-3.69 4.79-3.69 1.69 0 1.3 1.98 2.92 3.69C38.8 61.47 37.17 64.95 50 72.67c7.93 4.78 19.44.81 19.44 2.33 0 1.54-9.76 1.7-19.44 3.8-12.54 2.72-13.77 7.1-25 5.85-5.78-.65-8.2-3.72-9.02-9.65-1.57-11.39.59-13.42 4.23-25M71.52 50c0-2.75.84-3.73 3.48-4.66 11.6-4.07 14.4-6.95 25-5.34 4.79.72 5.77 5.49 5.77 10 0 2.99-2.63 2.84-5.77 5-12.24 8.42-16.72 17.6-25 16.15-5.96-1.05-3.48-11-3.48-21.15"
          stroke="rgba(238, 236, 164, 1)"
        />
        <Path
          d="M147.73 50c0-1.19.97-1.79 2.27-1.79 2.62 0 5.56.22 5.56 1.79 0 2.11-3.34 5.56-5.56 5.56-1.7 0-2.27-3.08-2.27-5.56"
          stroke="rgba(124, 121, 135, 1)"
        />
        <Path
          d="M293.57 50c0-1.4 3.33-2.74 6.43-2.74 2.28 0 4.33 1.35 4.33 2.74 0 1.42-2.05 2.88-4.33 2.88-3.1 0-6.43-1.47-6.43-2.88"
          stroke="rgba(104, 96, 164, 1)"
        />
        <Path
          d="M217.44 75c0-2.73 3.85-3.78 7.56-3.78 3.25 0 6.37 1.17 6.37 3.78 0 4.06-2.99 9.56-6.37 9.56-3.59 0-7.56-5.62-7.56-9.56M114 100c0-.98 5.61-3.82 11-3.82 4.04 0 7.86 2.81 7.86 3.82 0 .9-3.93 0-7.86 0-5.5 0-11 .93-11 0"
          stroke="rgba(124, 121, 135, 1)"
        />
        <Path
          d="M319.44 100c0-.28 2.97-1.11 5.56-1.11.67 0 .96.77.96 1.11 0 .22-.48 0-.96 0-2.78 0-5.56.27-5.56 0"
          stroke="rgba(104, 96, 164, 1)"
        />
        <Path
          d="M371.19 100c0-1.01 1.33-3.23 3.81-3.52 11.93-1.41 12.76-1.19 25 .12 4.19.45 7.86 2.51 7.86 3.4 0 .81-3.93 0-7.86 0h-25c-1.9 0-3.81.75-3.81 0M494.18 100c0-3.28 3.13-9.88 5.82-9.88 2.56 0 4.67 6.42 4.67 9.88 0 1.48-2.33 0-4.67 0-2.91 0-5.82 1.66-5.82 0M546.26 100c0-2.47 1.61-7.22 3.74-7.22 2.32 0 5.16 4.94 5.16 7.22 0 1.33-2.58 0-5.16 0-1.87 0-3.74 1.14-3.74 0"
          stroke="rgba(238, 236, 164, 1)"
        />
      </G>
      <Defs>
        <Mask id="SvgjsMask1007">
          <Path fill="#fff" d="M0 0H600V100H0z" />
        </Mask>
      </Defs>
    </Svg>
  );
}
