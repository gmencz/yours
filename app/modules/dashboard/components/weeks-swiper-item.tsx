import { Text, useTheme } from "@rneui/themed";
import {
  addWeeks,
  format,
  getDay,
  isThisWeek as isThisWeekUtil,
} from "date-fns";
import { Profile } from "modules/auth/hooks/use-profile-query";
import { WeekDay } from "modules/common/types";
import { ScrollView, View } from "react-native";
import { WeekCaloriesAndWeights } from "./week-calories-and-weights";
import { WeekDayCaloriesAndWeight } from "./week-day-calories-and-weight";
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
  const endOfWeekDate = addWeeks(startOfWeekDate, 1);
  const { theme } = useTheme();

  const isThisWeek = isThisWeekUtil(startOfWeekDate, {
    weekStartsOn: WeekDay.Monday,
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
          fontSize: 13,
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
      />

      <WeekInsights />
    </ScrollView>
  );
}
