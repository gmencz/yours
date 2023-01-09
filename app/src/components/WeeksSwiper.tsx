import { makeStyles, Skeleton, Text } from "@rneui/themed";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import Swiper from "react-native-swiper";
import { useProfileQuery } from "~/hooks/useProfileQuery";
import { useWeeksDatesQuery } from "~/hooks/useWeeksDatesQuery";
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
      <ScrollView style={styles.container}>
        <Skeleton width={60} height={10} />
        <Skeleton width={120} height={25} style={styles.mdSpacing} />
        <Skeleton width={150} height={20} style={styles.lgSpacing} />

        {/* Week days */}
        <Skeleton height={55} style={styles.xlSpacing} />
        <Skeleton height={55} style={styles.skeleton} />
        <Skeleton height={55} style={styles.skeleton} />
        <Skeleton height={55} style={styles.skeleton} />
        <Skeleton height={55} style={styles.skeleton} />
        <Skeleton height={55} style={styles.skeleton} />
        <Skeleton height={55} style={styles.skeleton} />
      </ScrollView>
    );
  }

  if (isErrorWeeksDates) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Something went wrong, try again later</Text>
      </View>
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
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: 30,
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
  },
}));
