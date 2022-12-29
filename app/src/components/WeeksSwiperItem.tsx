import { makeStyles, Text } from "@rneui/themed";
import {
  endOfDay,
  endOfWeek,
  format,
  isThisWeek as isThisWeekUtil,
} from "date-fns";
import { ScrollView } from "react-native";
import { Profile } from "~/hooks/useProfileQuery";
import { useWeekCaloriesAndWeightsQuery } from "~/hooks/useWeekCaloriesAndWeightsQuery";
import { WeekDay } from "~/typings";
import { Heading } from "./Heading";
import { WeekCaloriesAndWeights } from "./WeekCaloriesAndWeights";

interface WeeksSwiperItemProps {
  startOfWeekDate: Date;
  shouldLoad: boolean;
  profile: Profile;
  todayDate: Date;
}

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

  const isThisWeek = isThisWeekUtil(startOfWeekDate, {
    weekStartsOn: WeekDay.Monday,
  });

  const startOfWeekDateString = startOfWeekDate.toISOString();
  const endOfWeekDateString = endOfWeekDate.toISOString();
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

  const weekText = isThisWeek
    ? `This week`
    : `${format(startOfWeekDate, "do' 'MMM")} - ${format(
        endOfWeekDate,
        "do' 'MMM"
      )}`;

  const styles = useStyles();

  return (
    <ScrollView style={styles.container}>
      <Heading type="h1">Home</Heading>
      <Heading type="h2" style={styles.h2}>
        {weekText}
      </Heading>

      {isError ? (
        <Text style={styles.error}>Something went wrong, try again later</Text>
      ) : (
        <WeekCaloriesAndWeights
          endOfWeekDate={endOfWeekDate}
          isThisWeek={isThisWeek}
          profile={profile}
          startOfWeekDate={startOfWeekDate}
          todayDate={todayDate}
          isLoading={isLoading}
          queryKey={queryKey}
          weekCaloriesAndWeights={weekCaloriesAndWeights}
        />
      )}
    </ScrollView>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    padding: theme.spacing.xl,
  },

  error: {
    color: theme.colors.error,
  },

  h2: {
    marginTop: theme.spacing.sm,
  },
}));
