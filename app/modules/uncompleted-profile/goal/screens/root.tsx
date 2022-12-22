import { yupResolver } from "@hookform/resolvers/yup";
import { Picker } from "@react-native-picker/picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Icon, Text, useTheme } from "@rneui/themed";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Profile, useProfileQuery } from "modules/auth/hooks/use-profile-query";
import { Button } from "modules/common/components/button";
import { ControlledInput } from "modules/common/components/controlled-input";
import { ControlledPicker } from "modules/common/components/controlled-picker";
import { UncompletedProfileStackParamList } from "modules/common/types";
import { formatDecimal } from "modules/common/utils/format-decimal";
import { supabase } from "modules/supabase/client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";

type Props = NativeStackScreenProps<UncompletedProfileStackParamList, "Goal">;

const ONE_KG_IN_LBS = 2.205;

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

export type FormValues = yup.TypeOf<typeof schema>;

interface ProfileGoal {
  id: number;
}

export function GoalScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { data: profile } = useProfileQuery();

  const percentage = profile?.gender === "male" ? 1 : 0.5;
  let monthlyKgsChange = (profile!.initial_weight! / 100) * percentage;
  monthlyKgsChange = monthlyKgsChange > 1 ? 1 : monthlyKgsChange;
  const weeklyKgsChange = monthlyKgsChange / 4;
  const weeklyLbsChange = weeklyKgsChange * ONE_KG_IN_LBS;

  const {
    watch,
    control,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      goal: "build-muscle",
      approach: "bulk",
      // @ts-expect-error
      weeklyWeightChange:
        profile?.prefered_measurement_system === "imperial"
          ? formatDecimal(weeklyLbsChange).toString()
          : formatDecimal(weeklyKgsChange).toString(),
    },
  });

  useEffect(() => {
    setValue(
      "weeklyWeightChange",
      // @ts-expect-error
      profile?.prefered_measurement_system === "imperial"
        ? formatDecimal(weeklyLbsChange).toString()
        : formatDecimal(weeklyKgsChange).toString()
    );
  }, [profile?.prefered_measurement_system, profile?.gender]);

  const goal = watch("goal");
  const approach = watch("approach");

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
  const mutation = useMutation<ProfileGoal, unknown, FormValues>({
    mutationFn: async (values) => {
      const { data: profileGoal, error: profileGoalError } = await supabase
        .from("profiles_goals")
        .insert({
          profile_id: profile!.id,
          approach: values.approach,
          weekly_weight_change: values.weeklyWeightChange,
          goal: values.goal,
        })
        .select<string, ProfileGoal>("id");

      if (profileGoalError) {
        throw profileGoalError;
      }

      const { error: profilesError } = await supabase
        .from("profiles")
        .update({ goal_id: profileGoal[0].id })
        .eq("id", profile!.id);

      if (profilesError) {
        throw profilesError;
      }

      return profileGoal[0];
    },

    onSuccess: (data, { goal }) => {
      const queryData = queryClient.getQueryData<Profile>(["profile"]);
      if (queryData) {
        queryClient.setQueryData<Profile>(["profile"], {
          ...queryData,
          goal_id: data.id,
        });
      }
    },
  });

  const goToApp = (values: FormValues) => {
    mutation.mutate(values);
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
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("BasalEnergyExpenditure");
          }}
        >
          <Icon
            name="arrow-back-ios"
            type="material"
            size={25}
            style={{ alignSelf: "flex-start", marginBottom: theme.spacing.lg }}
          />
        </TouchableOpacity>

        <Text
          style={{
            color: theme.colors.grey1,
            marginBottom: theme.spacing.sm,
            fontSize: 13,
          }}
        >
          Step 2 of 2
        </Text>

        <Text
          style={{
            fontFamily: "InterBold",
            fontSize: 18,
          }}
        >
          Goal & Strategy
        </Text>

        <Text
          style={{
            color: theme.colors.grey0,
            marginTop: theme.spacing.md,
            marginBottom: theme.spacing.xl,
          }}
        >
          Tell us more about your goal so we can set you up with the perfect
          strategy to help you achieve it.
        </Text>

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
            helperDescription="Don't change your weekly weight change goal unless you really know what you're doing."
            helperText={
              profile?.prefered_measurement_system === "imperial"
                ? "lbs"
                : "kgs"
            }
            errorMessage={errors.weeklyWeightChange?.message?.toString()}
          />
        </View>

        <Button
          title="Start strategy"
          onPress={handleSubmit(goToApp)}
          variant="1"
          style={{
            marginTop: theme.spacing.xl,
            paddingHorizontal: theme.spacing.xl,
            borderRadius: 100,
            alignSelf: "center",
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
