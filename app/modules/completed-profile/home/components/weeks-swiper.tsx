import { Skeleton, Text, useTheme } from "@rneui/themed";
import { useProfileQuery } from "modules/auth/hooks/use-profile-query";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import Swiper from "react-native-swiper";
import { useWeeksDatesQuery } from "../hooks/use-weeks-dates-query";
import { WeeksSwiperItem } from "./weeks-swiper-item";

export function WeeksSwiper() {
  const todayDate = new Date();
  const { theme } = useTheme();
  const [loadedIndexes, setLoadedIndexes] = useState<Set<number>>(new Set());

  const {
    data: weeksDates,
    isLoading: isLoadingWeeksDates,
    isError: isErrorWeeksDates,
  } = useWeeksDatesQuery({
    onSuccess: (dates) => {
      setLoadedIndexes((prev) => new Set(prev).add(dates.length - 1));
    },
  });

  const { data: profile } = useProfileQuery();

  if (isLoadingWeeksDates) {
    return (
      <ScrollView
        style={{
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: 30,
        }}
      >
        <Skeleton width={60} height={10} />
        <Skeleton
          width={120}
          height={25}
          style={{ marginTop: theme.spacing.md }}
        />
        <Skeleton
          width={150}
          height={20}
          style={{ marginTop: theme.spacing.lg }}
        />

        {/* Week days */}
        <Skeleton height={42.5} style={{ marginTop: theme.spacing.xl }} />
        <Skeleton height={42.5} style={{ marginTop: 20 }} />
        <Skeleton height={42.5} style={{ marginTop: 20 }} />
        <Skeleton height={42.5} style={{ marginTop: 20 }} />
        <Skeleton height={42.5} style={{ marginTop: 20 }} />
        <Skeleton height={42.5} style={{ marginTop: 20 }} />
        <Skeleton height={42.5} style={{ marginTop: 20 }} />
      </ScrollView>
    );
  }

  if (isErrorWeeksDates) {
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
