import { Text, useTheme } from "@rneui/themed";
import { QueryKey } from "@tanstack/react-query";
import { Profile } from "modules/auth/hooks/use-profile-query";
import { WeekDay } from "modules/common/types";
import { View } from "react-native";
import { WeekDayCaloriesAndWeightData } from "../hooks/use-week-calories-and-weights-query";
import { WeekDayCaloriesAndWeight } from "./week-day-calories-and-weight";

type WeekCaloriesAndWeightsProps = {
  isThisWeek: boolean;
  shouldLoad: boolean;
  profile: Profile;
  startOfWeekDate: Date;
  endOfWeekDate: Date;
  todayDate: Date;
  queryKey: QueryKey;
  weekCaloriesAndWeights?: WeekDayCaloriesAndWeightData[];
  isLoading: boolean;
};

export function WeekCaloriesAndWeights({
  shouldLoad,
  profile,
  startOfWeekDate,
  endOfWeekDate,
  isThisWeek,
  todayDate,
  queryKey,
  weekCaloriesAndWeights,
  isLoading,
}: WeekCaloriesAndWeightsProps) {
  const endOfWeekDateString = endOfWeekDate.toISOString();
  const { theme } = useTheme();
  const weightUnit =
    profile.prefered_measurement_system === "imperial" ? "lbs" : "kg";

  return (
    <View style={{ marginTop: theme.spacing.md }}>
      <Text
        style={{
          fontFamily: "InterSemiBold",
          fontSize: 16,
          marginBottom: theme.spacing.md,
        }}
      >
        Calories & Weights
      </Text>

      {[
        WeekDay.Monday,
        WeekDay.Tuesday,
        WeekDay.Wednesday,
        WeekDay.Thursday,
        WeekDay.Friday,
        WeekDay.Saturday,
        WeekDay.Sunday,
      ].map((day) => (
        <WeekDayCaloriesAndWeight
          key={`${day}-${endOfWeekDateString}`}
          day={day}
          isThisWeek={isThisWeek}
          profile={profile}
          queryKey={queryKey}
          startOfWeekDate={startOfWeekDate}
          todayDate={todayDate}
          weightUnit={weightUnit}
          weekCaloriesAndWeights={weekCaloriesAndWeights}
          isLoading={isLoading}
        />
      ))}
    </View>
  );
}
