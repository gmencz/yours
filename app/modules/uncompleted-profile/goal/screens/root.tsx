import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Icon, Text, useTheme } from "@rneui/themed";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Profile, useProfileQuery } from "modules/auth/hooks/use-profile-query";
import { Button } from "modules/common/components/button";
import { RadioButton } from "modules/common/components/radio-button";
import { UncompletedProfileStackParamList } from "modules/common/types";
import { supabase } from "modules/supabase/client";
import { useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Goal = "cut" | "bulk" | "maingain" | "aggresive_bulk";

type Props = NativeStackScreenProps<UncompletedProfileStackParamList, "Goal">;

export function GoalScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { data: profile } = useProfileQuery();
  const [goal, setGoal] = useState<Goal>((profile?.goal as Goal) || "maingain");

  const queryClient = useQueryClient();

  const mutation = useMutation<unknown, unknown, { goal: Goal }>({
    mutationFn: async ({ goal }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ goal })
        .eq("id", profile!.id);

      if (error) {
        throw error;
      }

      return true;
    },

    onSuccess: (_data, { goal }) => {
      const queryData = queryClient.getQueryData<Profile>(["profile"]);
      if (queryData) {
        queryClient.setQueryData<Profile>(["profile"], {
          ...queryData,
          goal,
        });
      }
    },
  });

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
            color={theme.colors.primary}
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
          Tell us what your goal is so we can adjust your daily caloric intake
          among other things.
        </Text>

        <RadioButton
          label="Maingain"
          labelDescription="Great if you're happy with where your body is in terms of fat and want to build muscle avoiding cutting and bulking cycles."
          onPress={() => setGoal("maingain")}
          pressed={goal === "maingain"}
          value={goal}
          style={{ marginBottom: theme.spacing.xl }}
        />

        <RadioButton
          label="Lean Bulk"
          labelDescription="Great if you want to build a lot of muscle with a small amount of fat."
          onPress={() => setGoal("bulk")}
          pressed={goal === "bulk"}
          value={goal}
          style={{ marginBottom: theme.spacing.xl }}
        />

        <RadioButton
          label="Aggressive Bulk"
          labelDescription="Great if you're underweight and want to put on a lot of mass."
          onPress={() => setGoal("aggresive_bulk")}
          pressed={goal === "aggresive_bulk"}
          value={goal}
          style={{ marginBottom: theme.spacing.xl }}
        />

        <RadioButton
          label="Cut"
          labelDescription="Great if you're overweight and want to lose fat."
          onPress={() => setGoal("cut")}
          pressed={goal === "cut"}
          value={goal}
        />

        <Button
          title="Go to app"
          onPress={() => {
            mutation.mutate({ goal });
          }}
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
