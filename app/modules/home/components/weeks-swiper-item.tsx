import { Text, useTheme } from "@rneui/themed";
import { addWeeks, format, getDay, isThisWeek } from "date-fns";
import { Profile } from "modules/auth/hooks/use-profile-query";
import { WeekDay } from "modules/common/types";
import { formatDecimal } from "modules/common/utils/format-decimal";
import { ScrollView, View } from "react-native";
import { useWeekCaloriesAndWeightsQuery } from "../hooks/use-week-calories-and-weights-query";
import { WeekDayCaloriesAndWeight } from "./week-day-calories-and-weight";

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
  const startOfWeekDateString = startOfWeekDate.toISOString();
  const endOfWeekDate = addWeeks(startOfWeekDate, 1);
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

  if (isLoading) {
    return (
      <View
        style={{ paddingHorizontal: theme.spacing.xl, paddingVertical: 30 }}
      >
        <Text>Loading week data ...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={{ paddingHorizontal: theme.spacing.xl, paddingVertical: 30 }}
      >
        <Text style={{ color: theme.colors.error }}>
          Something went wrong, try again later
        </Text>
      </View>
    );
  }

  const filteredCalories = weekCaloriesAndWeights.filter(
    ({ calories }) => !!calories
  );

  const averageCalories =
    filteredCalories.reduce((acc, entry) => acc + entry.calories, 0) /
    filteredCalories.length;

  const filteredWeight = weekCaloriesAndWeights.filter(
    ({ weight }) => !!weight
  );

  const averageWeight =
    filteredWeight.reduce((acc, entry) => acc + entry.weight, 0) /
    filteredWeight.length;

  const hasSomeDayOfThisWeek = isThisWeek(startOfWeekDate, {
    weekStartsOn: WeekDay.Monday,
  });

  const weightUnit =
    profile.prefered_measurement_system === "imperial" ? "lbs" : "kg";

  return (
    <ScrollView
      style={{
        flexDirection: "column",
        flex: 1,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: 30,
      }}
    >
      <Text
        style={{
          fontFamily: "InterBold",
          fontSize: 16,
          marginBottom: theme.spacing.lg,
        }}
      >
        {hasSomeDayOfThisWeek
          ? `This Week`
          : `${format(startOfWeekDate, "do' 'MMM")} - ${format(
              endOfWeekDate,
              "do' 'MMM"
            )}`}
      </Text>

      <View style={{ flexDirection: "column" }}>
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
            hasSomeDayOfThisWeek={hasSomeDayOfThisWeek}
            profile={profile}
            queryKey={queryKey}
            startOfWeekDate={startOfWeekDate}
            todayDate={todayDate}
            weightUnit={weightUnit}
            dayData={weekCaloriesAndWeights.find((entry) => {
              if (day === getDay(new Date(entry.created_at))) {
                return entry;
              }
            })}
          />
        ))}

        <View
          style={{
            flexDirection: "row",
            borderRadius: 5,
            alignItems: "center",
            marginTop: theme.spacing.sm,
            paddingHorizontal: hasSomeDayOfThisWeek ? 10 : 0,
          }}
        >
          <View style={{ width: theme.spacing.xl }} />

          <View
            style={{
              flex: 1,
              marginRight: theme.spacing.lg,
              alignItems: "center",
            }}
          >
            {averageCalories ? (
              <>
                <Text>{Math.round(averageCalories)} kcal</Text>
                <Text style={{ color: theme.colors.grey0, fontSize: 13 }}>
                  Average calories
                </Text>
              </>
            ) : null}
          </View>

          <View
            style={{
              flex: 1,
              alignItems: "center",
            }}
          >
            {averageWeight ? (
              <>
                <Text>
                  {formatDecimal(averageWeight)} {weightUnit}
                </Text>
                <Text style={{ color: theme.colors.grey0, fontSize: 13 }}>
                  Average weight
                </Text>
              </>
            ) : null}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
