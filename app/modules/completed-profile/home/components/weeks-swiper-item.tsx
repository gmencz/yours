import { Text, useTheme } from "@rneui/themed";
import {
  endOfDay,
  endOfWeek,
  format,
  isThisWeek as isThisWeekUtil,
} from "date-fns";
import { Profile } from "modules/auth/hooks/use-profile-query";
import { Heading1, Heading2 } from "modules/common/components/headings";
import { WeekDay } from "modules/common/types";
import { ScrollView } from "react-native";
import { useWeekCaloriesAndWeightsQuery } from "../hooks/use-week-calories-and-weights-query";
import { WeekCaloriesAndWeights } from "./week-calories-and-weights";

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
  const endOfWeekDate = endOfDay(
    endOfWeek(startOfWeekDate, {
      weekStartsOn: WeekDay.Monday,
    })
  );

  const { theme } = useTheme();

  const isThisWeek = isThisWeekUtil(startOfWeekDate, {
    weekStartsOn: WeekDay.Monday,
  });

  const startOfWeekDateString = startOfWeekDate.toISOString();
  const endOfWeekDateString = endOfWeekDate.toISOString();
  const queryKey = ["weekCaloriesAndWeights", startOfWeekDateString];
  const {
    data: weekCaloriesAndWeights,
    isLoading,
    error,
  } = useWeekCaloriesAndWeightsQuery({
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
      <Heading1>Home</Heading1>

      <Heading2 style={{ marginTop: theme.spacing.sm }}>
        {isThisWeek
          ? `This week`
          : `${format(startOfWeekDate, "do' 'MMM")} - ${format(
              endOfWeekDate,
              "do' 'MMM"
            )}`}
      </Heading2>

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
    </ScrollView>
  );
}
