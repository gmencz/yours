import { makeStyles, Text } from "@rneui/themed";
import {
  endOfDay,
  endOfWeek,
  format,
  isThisWeek as isThisWeekUtil,
} from "date-fns";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
    <SafeAreaView style={styles.safeAreaView}>
      <ScrollView style={styles.container}>
        <View style={styles.headingContainer}>
          <Heading type="h1">Home</Heading>
          <Heading type="h2">{weekText}</Heading>
        </View>

        {isError ? (
          <Text style={styles.error}>
            Something went wrong, try again later
          </Text>
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
    </SafeAreaView>
  );
}

const useStyles = makeStyles((theme) => ({
  safeAreaView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: theme.spacing.xl,
  },
  headingContainer: {
    marginBottom: theme.spacing.sm,
  },
  mainContainer: {
    padding: theme.spacing.xl,
  },
  error: {
    color: theme.colors.error,
  },
}));
