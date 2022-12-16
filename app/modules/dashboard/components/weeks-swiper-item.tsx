import { Text, useTheme } from "@rneui/themed";
import {
  addDays,
  addWeeks,
  format,
  getDay,
  isThisWeek as isThisWeekUtil,
} from "date-fns";
import { Profile } from "modules/auth/hooks/use-profile-query";
import { WeekDay } from "modules/common/types";
import { ScrollView } from "react-native";
import { useWeekCaloriesAndWeightsQuery } from "../hooks/use-week-calories-and-weights-query";
import { WeekCaloriesAndWeights } from "./week-calories-and-weights";
import { WeekInsights } from "./week-insights";

type WeeksSwiperItemProps = {
  startOfWeekDate: Date;
  shouldLoad: boolean;
  profile: Profile;
  todayDate: Date;
};

export function WeeksSwiperItem({
  startOfWeekDate,
  shouldLoad,
  profile,
  todayDate,
}: WeeksSwiperItemProps) {
  const endOfWeekDate = addDays(startOfWeekDate, 6);
  const { theme } = useTheme();

  const isThisWeek = isThisWeekUtil(startOfWeekDate, {
    weekStartsOn: WeekDay.Monday,
  });

  const startOfWeekDateString = startOfWeekDate.toISOString();
  const endOfWeekDateString = endOfWeekDate.toISOString();
  const queryKey = ["weekCaloriesAndWeights", startOfWeekDateString];
  const { data: weekCaloriesAndWeights, isLoading } =
    useWeekCaloriesAndWeightsQuery({
      enabled: shouldLoad,
      profileId: profile.id,
      queryKey,
      startOfWeekDateString,
      endOfWeekDateString,
    });

  return (
    <ScrollView
      style={{
        flex: 1,
        padding: theme.spacing.xl,
      }}
    >
      <Text
        style={{
          color: theme.colors.grey1,
        }}
      >
        {isThisWeek
          ? `This week`
          : `${format(startOfWeekDate, "do' 'MMM")} - ${format(
              endOfWeekDate,
              "do' 'MMM"
            )}`}
      </Text>

      <Text style={{ fontFamily: "InterBold", fontSize: 20 }}>Dashboard</Text>

      <WeekCaloriesAndWeights
        endOfWeekDate={endOfWeekDate}
        isThisWeek={isThisWeek}
        profile={profile}
        shouldLoad={shouldLoad}
        startOfWeekDate={startOfWeekDate}
        todayDate={todayDate}
        isLoading={isLoading}
        queryKey={queryKey}
        weekCaloriesAndWeights={weekCaloriesAndWeights}
      />

      <WeekInsights
        weekCaloriesAndWeights={weekCaloriesAndWeights}
        isLoading={isLoading}
        startOfWeekDateString={startOfWeekDateString}
      />
    </ScrollView>
  );
}
