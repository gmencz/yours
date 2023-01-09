import { makeStyles } from "@rneui/themed";
import { QueryKey } from "@tanstack/react-query";
import { View } from "react-native";
import { Profile } from "~/hooks/useProfileQuery";
import { WeekDayCaloriesAndWeightData } from "~/hooks/useWeekCaloriesAndWeightsQuery";
import { WeekDay } from "~/typings";
import { WeekDayCaloriesAndWeight } from "./WeekDayCaloriesAndWeight";

interface WeekCaloriesAndWeightsProps {
  isThisWeek: boolean;
  profile: Profile;
  startOfWeekDate: Date;
  endOfWeekDate: Date;
  todayDate: Date;
  queryKey: QueryKey;
  weekCaloriesAndWeights?: WeekDayCaloriesAndWeightData[];
  isLoading: boolean;
}

export function WeekCaloriesAndWeights({
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
  const styles = useStyles({ isThisWeek });
  const weightUnit =
    profile.preferedMeasurementSystem === "imperial" ? "lbs" : "kg";

  return (
    <View style={styles.container}>
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
          endOfWeekDate={endOfWeekDate}
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

interface UseStylesProps {
  isThisWeek: boolean;
}

const useStyles = makeStyles((theme, props: UseStylesProps) => ({
  container: {
    marginTop: theme.spacing.md,
  },

  labelsContainer: {
    paddingHorizontal: props.isThisWeek ? 10 : 0,
    flexDirection: "row",
    marginTop: theme.spacing.sm,
  },

  labelsSpacer: {
    width: theme.spacing.xl,
  },

  caloriesLabel: {
    marginRight: theme.spacing.lg,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  weightLabel: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  labelText: {
    textAlign: "center",
    color: theme.colors.grey0,
  },
}));
