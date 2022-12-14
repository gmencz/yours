import { Text, useTheme } from "@rneui/themed";
import { useProfileQuery } from "modules/auth/hooks/use-profile-query";
import { useState } from "react";
import { View } from "react-native";
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

  const {
    data: profile,
    isLoading: isLoadingProfile,
    isError: isErrorProfile,
  } = useProfileQuery();

  const isLoading = isLoadingWeeksDates && isLoadingProfile;
  const isError = isErrorWeeksDates && isErrorProfile;
  const isSuccess = !!weeksDates && !!profile;

  return (
    <>
      {isLoading ? (
        <View
          style={{ paddingHorizontal: theme.spacing.xl, paddingVertical: 30 }}
        >
          <Text>Loading profile...</Text>
        </View>
      ) : isError ? (
        <View
          style={{ paddingHorizontal: theme.spacing.xl, paddingVertical: 30 }}
        >
          <Text style={{ color: theme.colors.error }}>
            Something went wrong, try again later
          </Text>
        </View>
      ) : isSuccess ? (
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
              profile={profile}
              shouldLoad={loadedIndexes.has(index)}
              startOfWeekDate={weekDate}
              todayDate={todayDate}
            />
          ))}
        </Swiper>
      ) : null}
    </>
  );
}
