import { yupResolver } from "@hookform/resolvers/yup";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Icon, makeStyles, Text } from "@rneui/themed";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";
import { Picker as RNPicker } from "@react-native-picker/picker";
import { Picker } from "~/components/Picker";
import { useProfileQuery } from "~/hooks/useProfileQuery";
import { useProfileStepTwoMutation } from "~/hooks/useProfileStepTwoMutation";
import { UncompletedProfileStackParamList } from "~/typings";
import { formatDecimal } from "~/utils/formatDecimal";
import { getRecommendedWeeklyWeightChange } from "~/utils/getRecommendedWeeklyWeightChange";
import { Input } from "~/components/Input";
import { Button } from "~/components/Button";

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

  const {
    watch,
    control,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm<Schema>({
    resolver: yupResolver(schema),
    defaultValues: {
      goal: "build-muscle",
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

  const mutation = useProfileStepTwoMutation({ profile: profile! });

  const goToApp = (values: Schema) => {
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
    <SafeAreaView style={styles.safeAreaView}>
      <ScrollView style={styles.scrollView}>
        <TouchableOpacity onPress={goBack}>
          <Icon
            name="arrow-back-ios"
            type="material"
            size={25}
            style={styles.goBack}
          />
        </TouchableOpacity>

        <Text style={styles.stepText}>Step 2 of 2</Text>
        <Text style={styles.stepNameText}>Goal & Strategy</Text>
        <Text style={styles.stepDescriptionText}>
          Tell us more about your goal so we can set you up with the perfect
          strategy to help you achieve it.
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
          <RNPicker.Item
            label="Build muscle"
            value="build-muscle"
            style={styles.pickerItem}
          />
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

        <View style={styles.inputContainer}>
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

        <View style={styles.inputContainer}>
          <Input
            control={control}
            editable={false}
            label="Weekly weight change goal"
            name="weeklyWeightChange"
            keyboardType="numeric"
            helperText="This is the recommended weekly weight change goal based on nutrition and behavioral science and is only editable in the strategy's settings once startedz."
            suffix={
              profile?.preferedMeasurementSystem === "imperial" ? "lbs" : "kgs"
            }
            errorMessage={errors.weeklyWeightChange?.message?.toString()}
          />
        </View>

        <Button
          title="Start strategy"
          onPress={handleSubmit(goToApp)}
          variant="1"
          style={styles.goToAppButton}
        />
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
    fontFamily: "SoraBold",
    fontSize: 18,
  },

  stepDescriptionText: {
    color: theme.colors.grey0,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },

  pickerItem: {
    fontFamily: "SoraRegular",
  },

  inputContainer: {
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
