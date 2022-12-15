import { Text, useTheme } from "@rneui/themed";
import { Profile } from "modules/auth/hooks/use-profile-query";
import { WeekDay } from "modules/common/types";
import { View } from "react-native";
import { useWeekCaloriesAndWeightsQuery } from "../hooks/use-week-calories-and-weights-query";
import { WeekDayCaloriesAndWeight } from "./week-day-calories-and-weight";

type WeekCaloriesAndWeightsProps = {
  isThisWeek: boolean;
  shouldLoad: boolean;
  profile: Profile;
  startOfWeekDate: Date;
  endOfWeekDate: Date;
  todayDate: Date;
};

export function WeekCaloriesAndWeights({
  shouldLoad,
  profile,
  startOfWeekDate,
  endOfWeekDate,
  isThisWeek,
  todayDate,
}: WeekCaloriesAndWeightsProps) {
  const weightUnit =
    profile.prefered_measurement_system === "imperial" ? "lbs" : "kg";
  const startOfWeekDateString = startOfWeekDate.toISOString();
  const endOfWeekDateString = endOfWeekDate.toISOString();
  const { theme } = useTheme();
  const queryKey = ["weekCaloriesAndWeights", startOfWeekDateString];
  const {
    data: weekCaloriesAndWeights,
    isLoading,
    isError,
  } = useWeekCaloriesAndWeightsQuery({
    enabled: shouldLoad,
    profileId: profile.id,
    queryKey,
    startOfWeekDateString,
    endOfWeekDateString,
  });

  return (
    <View style={{ marginTop: theme.spacing.md }}>
      <Text
        style={{
          fontFamily: "InterMedium",
          fontSize: 18,
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
