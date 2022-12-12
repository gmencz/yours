import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon, Text, useTheme } from "@rneui/themed";

import { AuthorizedStackParamList } from "types";
import { Animated, Dimensions, ScrollView, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "modules/supabase/client";
import { add, format, getDay, isToday, startOfWeek, sub } from "date-fns";
import { Profile, useProfileQuery } from "modules/auth/hooks/use-profile-query";
import { useRef, useState } from "react";
import { useSwipe } from "modules/common/hooks/use-swipe";

type Props = NativeStackScreenProps<AuthorizedStackParamList, "Home">;

enum WeekDay {
  Sunday,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
}

const weekDaysWithNames = {
  [WeekDay.Sunday]: "SUNDAY",
  [WeekDay.Monday]: "MONDAY",
  [WeekDay.Tuesday]: "TUESDAY",
  [WeekDay.Wednesday]: "WEDNESDAY",
  [WeekDay.Thursday]: "THURSDAY",
  [WeekDay.Friday]: "FRIDAY",
  [WeekDay.Saturday]: "SATURDAY",
};

export function HomeScreen({ navigation }: Props) {
  const todayDate = new Date();
  const { theme } = useTheme();
  const { data: profile } = useProfileQuery();
  const [startOfWeekToFetch, setStartOfWeekToFetch] = useState(
    startOfWeek(todayDate, { weekStartsOn: WeekDay.Monday })
  );

  const { onTouchStart, onTouchEnd } = useSwipe(onSwipeLeft, onSwipeRight);

  function onSwipeRight() {
    Animated.timing(translateXAnim, {
      toValue: Dimensions.get("screen").width,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      const previousWeek = sub(startOfWeekToFetch, {
        weeks: 1,
      });

      setStartOfWeekToFetch(previousWeek);

      Animated.timing(translateXAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }

  function onSwipeLeft() {
    Animated.timing(translateXAnim, {
      toValue: -Dimensions.get("screen").width,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      const nextWeek = add(startOfWeekToFetch, {
        weeks: 1,
      });

      setStartOfWeekToFetch(nextWeek);

      Animated.timing(translateXAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }

  const translateXAnim = useRef(new Animated.Value(0)).current;

  const animate = () => {};

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      <Animated.ScrollView
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          flex: 1,
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: 30,
          transform: [{ translateX: translateXAnim }],
        }}
      >
        <Text style={{ color: theme.colors.grey1 }}>
          {format(todayDate, "EEEE', 'MMMM' 'd")}
        </Text>

        {profile ? (
          <ThisWeekData
            startOfWeekToFetch={startOfWeekToFetch}
            profile={profile}
            todayDate={todayDate}
          />
        ) : null}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

type ThisWeekDataProps = {
  todayDate: Date;
  profile: Profile;
  startOfWeekToFetch: Date;
};

function ThisWeekData({
  todayDate,
  profile,
  startOfWeekToFetch,
}: ThisWeekDataProps) {
  const startOfWeekToFetchString = startOfWeekToFetch.toISOString();
  const endOfWeekToFetch = add(startOfWeekToFetch, { days: 6 });
  const endOfWeekToFetchString = endOfWeekToFetch.toISOString();
  const { theme } = useTheme();
  const { data, isLoading, isError } = useQuery({
    staleTime: Infinity,
    queryKey: ["weeklyCaloriesAndWeights", startOfWeekToFetchString],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles_calories_and_weights")
        .select<
          string,
          {
            id: string;
            created_at: string;
            calories: number;
            weight: number;
          }
        >(
          `
          id,
          created_at,
          calories,
          weight
          `
        )
        .gte("created_at", startOfWeekToFetchString)
        .lte("created_at", endOfWeekToFetchString)
        .eq("profile_id", profile.id)
        .limit(7)
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      return data;
    },
  });

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (isError) {
    return <Text>Loading...</Text>;
  }

  const hasData = data.length > 0;

  const averageKcal = hasData
    ? data.reduce((acc, entry) => acc + entry.calories, 0) / data.length
    : undefined;

  const averageWeight = hasData
    ? data.reduce((acc, entry) => acc + entry.weight, 0) / data.length
    : undefined;

  const isThisWeek = data.some((entry) => isToday(new Date(entry.created_at)));

  return (
    <View
      style={{
        flexDirection: "column",
        marginTop: theme.spacing.sm,
      }}
    >
      <Text
        style={{
          fontFamily: "InterBold",
          fontSize: 16,
          marginBottom: theme.spacing.lg,
        }}
      >
        {isThisWeek
          ? `This Week`
          : `${format(startOfWeekToFetch, "do' 'MMM")} - ${format(
              endOfWeekToFetch,
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
        ].map((day) => {
          const dayData = data?.find((entry) => {
            if (day === getDay(new Date(entry.created_at))) {
              return entry;
            }
          });

          const isDayToday = dayData
            ? isToday(new Date(dayData.created_at))
            : false;

          const weekDayName = weekDaysWithNames[day];

          return (
            <View
              key={weekDayName}
              style={{
                flexDirection: "row",
                borderWidth: isDayToday ? 1 : 0,
                borderColor: theme.colors.black,
                paddingVertical: 10,
                paddingHorizontal: isThisWeek ? 10 : 0,
                borderRadius: 5,
                alignItems: "center",
              }}
            >
              <Text style={{ width: theme.spacing.xl }}>{weekDayName[0]}</Text>

              <View
                style={{
                  backgroundColor: theme.colors.grey5,
                  padding: 10,
                  flex: 1,
                  borderRadius: 5,
                  marginRight: theme.spacing.lg,
                }}
              >
                <Text style={{ textAlign: "center" }}>
                  {dayData ? `${dayData.calories} kcal` : null}
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: theme.colors.grey5,
                  padding: 10,
                  flex: 1,
                  borderRadius: 5,
                }}
              >
                <Text style={{ textAlign: "center" }}>
                  {dayData
                    ? `${dayData.weight} ${
                        profile?.prefered_measurement_system === "imperial"
                          ? "lbs"
                          : "kg"
                      }`
                    : null}
                </Text>
              </View>
            </View>
          );
        })}

        <View
          style={{
            flexDirection: "row",
            borderRadius: 5,
            alignItems: "center",
            marginTop: theme.spacing.sm,
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
            {averageKcal ? (
              <>
                <Text style={{ fontFamily: "InterBold" }}>{averageKcal}</Text>
                <Text style={{ color: theme.colors.grey0 }}>Average kcal</Text>
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
                <Text style={{ fontFamily: "InterBold" }}>{averageWeight}</Text>

                <Text style={{ color: theme.colors.grey0 }}>
                  Average{" "}
                  {profile?.prefered_measurement_system === "imperial"
                    ? "lbs"
                    : "kg"}
                </Text>
              </>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}
