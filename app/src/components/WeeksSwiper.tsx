import { makeStyles, Skeleton, Text } from "@rneui/themed";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";
import { useProfileQuery } from "~/hooks/useProfileQuery";
import { useWeeksDatesQuery } from "~/hooks/useWeeksDatesQuery";
import { GenericError } from "./GenericError";
import { Heading } from "./Heading";
import { WeeksSwiperItem } from "./WeeksSwiperItem";

export function WeeksSwiper() {
  const todayDate = new Date();
  const [loadedIndexes, setLoadedIndexes] = useState<Set<number>>(new Set());
  const { data: profile } = useProfileQuery();
  const {
    data: weeksDates,
    isLoading: isLoadingWeeksDates,
    isError: isErrorWeeksDates,
    isSuccess: isSuccessWeeksDates,
  } = useWeeksDatesQuery();

  useEffect(() => {
    if (isSuccessWeeksDates) {
      setLoadedIndexes((prev) => new Set(prev).add(weeksDates.length - 1));
    }
  }, [isSuccessWeeksDates, weeksDates?.length]);

  const styles = useStyles();

  if (isLoadingWeeksDates) {
    return (
      <SafeAreaView style={styles.safeAreaView}>
        <ScrollView style={styles.container}>
          <Skeleton width={120} height={30} style={styles.mdSpacing} />
          <Skeleton width={150} height={25} style={styles.lgSpacing} />

          {/* Week days */}
          <Skeleton height={50} style={[styles.skeleton, styles.xlSpacing]} />
          <Skeleton height={50} style={styles.skeleton} />
          <Skeleton height={50} style={styles.skeleton} />
          <Skeleton height={50} style={styles.skeleton} />
          <Skeleton height={50} style={styles.skeleton} />
          <Skeleton height={50} style={styles.skeleton} />
          <Skeleton height={50} style={styles.skeleton} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isErrorWeeksDates) {
    return (
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.container}>
          <GenericError />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <Swiper
      loop={false}
      showsPagination={false}
      index={weeksDates.length - 1}
      onIndexChanged={(index) => {
        setLoadedIndexes((prev) => new Set(prev).add(index));
      }}
    >
      {weeksDates.map((weekDate, index) => (
        <WeeksSwiperItem
          key={weekDate.toISOString()}
          profile={profile!}
          shouldLoad={loadedIndexes.has(index)}
          startOfWeekDate={weekDate}
          todayDate={todayDate}
        />
      ))}
    </Swiper>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    padding: theme.spacing.xl,
  },
  safeAreaView: {
    flex: 1,
  },
  error: {
    color: theme.colors.error,
  },

  mdSpacing: {
    marginTop: theme.spacing.md,
  },

  lgSpacing: {
    marginTop: theme.spacing.lg,
  },

  xlSpacing: {
    marginTop: theme.spacing.xl,
  },

  skeleton: {
    marginTop: 20,
    borderRadius: 10,
  },
}));
