import { Icon, Skeleton, Text, useTheme } from "@rneui/themed";
import { useProfileQuery } from "modules/auth/hooks/use-profile-query";
import { Button } from "modules/common/components/button";
import { Heading1, Heading2 } from "modules/common/components/headings";
import { themeColor3 } from "modules/common/utils/colors";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EditGoal } from "../components/edit-goal";
import { StrategyTarget } from "../components/strategy-target";
import { useStrategyQuery } from "../hooks/use-strategy-query";

export function StrategyScreen() {
  const { theme } = useTheme();
  const { data: profile } = useProfileQuery();
  const [editGoal, setEditGoal] = useState(false);
  const {
    data: strategy,
    isLoading,
    isError,
  } = useStrategyQuery({ profile: profile! });

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.xl,
        }}
      >
        <Heading1>Strategy</Heading1>
        <Heading2 style={{ marginBottom: theme.spacing.lg }}>
          We have set up some targets for you to hit based on your goal which
          will help you reach it with optimal muscle growth.
        </Heading2>

        {isLoading ? (
          <>
            <Skeleton height={42.5} />
            <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
            <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
            <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
            <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
            <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
            <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
          </>
        ) : isError ? (
          <Text
            style={{
              color: theme.colors.error,
              paddingHorizontal: theme.spacing.xl,
            }}
          >
            Something went wrong calculating your weight trend.
          </Text>
        ) : (
          <>
            <Button
              title={editGoal ? "Cancel edit" : "Edit goal"}
              variant="2"
              style={{
                paddingLeft: theme.spacing.lg,
                paddingRight: theme.spacing.xl,
                alignSelf: "flex-start",
                marginBottom: theme.spacing.xl,
              }}
              icon={
                <Icon
                  type="material"
                  name={editGoal ? "edit-off" : "edit"}
                  size={20}
                  style={{ marginRight: theme.spacing.md }}
                />
              }
              small
              onPress={() => {
                setEditGoal((p) => !p);
              }}
            />

            {editGoal ? (
              <EditGoal
                profile={profile!}
                setEditGoal={setEditGoal}
                goalQueryData={strategy.goal}
              />
            ) : (
              <>
                <StrategyTarget
                  amount={strategy.recommendedDailyCalories}
                  unit="kcal"
                  color={theme.colors.primary}
                  name="Daily calorie intake"
                  icon={
                    <Icon
                      type="material-community"
                      name="fire"
                      size={40}
                      color={theme.colors.black}
                    />
                  }
                />

                <View style={{ marginTop: theme.spacing.xl }}>
                  <StrategyTarget
                    amount={strategy.recommendedProteinIntake}
                    unit="g"
                    color={theme.colors.secondary}
                    name="Daily protein intake"
                    icon={
                      <Icon
                        type="material-community"
                        name="arm-flex"
                        size={40}
                        color={theme.colors.black}
                      />
                    }
                  />
                </View>

                <View style={{ marginTop: theme.spacing.xl }}>
                  <StrategyTarget
                    amount={8}
                    unit="hours"
                    color={themeColor3}
                    name="Daily sleep"
                    icon={
                      <Icon
                        type="material-community"
                        name="sleep"
                        size={40}
                        color={theme.colors.black}
                      />
                    }
                  />
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
