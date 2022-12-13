import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, useTheme } from "@rneui/themed";

import { AuthorizedStackParamList } from "types";
import { ScrollView, TextInput, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "modules/supabase/client";
import * as yup from "yup";
import {
  add,
  addWeeks,
  format,
  getDay,
  isSameWeek,
  isThisWeek,
  isToday,
  startOfWeek,
  sub,
} from "date-fns";
import { Profile, useProfileQuery } from "modules/auth/hooks/use-profile-query";
import Swiper from "react-native-swiper";
import { PostgrestError } from "@supabase/supabase-js";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";

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

  // Get the dates of the first and last registered calories and weights.
  const {
    data: firstAndLastDates,
    isLoading,
    isError,
    isSuccess,
  } = useQuery<[Date | null, Date | null], PostgrestError>({
    queryKey: ["firstAndLastDatesOfCaloriesAndWeights"],
    enabled: !!profile,
    staleTime: Infinity,
    queryFn: async () => {
      const [firstQuery, lastQuery] = await Promise.all([
        supabase
          .from("profiles_calories_and_weights")
          .select<string, { created_at: string }>("created_at")
          .eq("profile_id", profile!.id)
          .limit(1)
          .order("created_at", { ascending: true }),

        supabase
          .from("profiles_calories_and_weights")
          .select<string, { created_at: string }>("created_at")
          .eq("profile_id", profile!.id)
          .limit(1)
          .order("created_at", { ascending: false }),
      ]);

      if (firstQuery.error || lastQuery.error) {
        throw firstQuery.error || lastQuery.error;
      }

      const firstData = firstQuery.data[0];
      const lastData = lastQuery.data[0];

      return [
        firstData?.created_at ? new Date(firstData.created_at) : null,
        lastData?.created_at ? new Date(lastData.created_at) : null,
      ];
    },
  });

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      {isLoading ? (
        <Text>Loading...</Text>
      ) : isError ? (
        <Text style={{ color: theme.colors.error }}>Error</Text>
      ) : isSuccess && profile ? (
        <SwipableWeeks
          todayDate={todayDate}
          profile={profile}
          firstDate={firstAndLastDates[0]}
          lastDate={firstAndLastDates[1]}
        />
      ) : null}
    </SafeAreaView>
  );
}

type SwipableWeeksProps = {
  firstDate: Date | null;
  lastDate: Date | null;
  profile: Profile;
  todayDate: Date;
};

function SwipableWeeks({
  firstDate,
  lastDate,
  profile,
  todayDate,
}: SwipableWeeksProps) {
  const startOfWeeksToFetch: Date[] = [];
  if (firstDate && lastDate) {
    const firstDateStartOfWeek = startOfWeek(firstDate, {
      weekStartsOn: WeekDay.Monday,
    });

    const lastDateStartOfWeek = startOfWeek(lastDate, {
      weekStartsOn: WeekDay.Monday,
    });

    startOfWeeksToFetch.push(firstDateStartOfWeek);
    if (!isSameWeek(firstDateStartOfWeek, lastDateStartOfWeek)) {
      // Fetch all the weeks after first date up until last date
      let reachedEnd = false;
      while (!reachedEnd) {
        const lastFetchedWeek =
          startOfWeeksToFetch[startOfWeeksToFetch.length - 1];

        const nextWeek = addWeeks(lastFetchedWeek, 1);
        if (isSameWeek(nextWeek, lastDateStartOfWeek)) {
          reachedEnd = true;
          startOfWeeksToFetch.push(lastDateStartOfWeek);
        } else {
          startOfWeeksToFetch.push(nextWeek);
        }
      }
    }
  } else {
    startOfWeeksToFetch.push(
      startOfWeek(todayDate, { weekStartsOn: WeekDay.Monday })
    );
  }

  return (
    <>
      <Swiper
        loop={false}
        showsPagination={false}
        index={startOfWeeksToFetch.length - 1}
      >
        {startOfWeeksToFetch.map((startOfWeekToFetch) => (
          <WeekData
            key={startOfWeekToFetch.toISOString()}
            profile={profile}
            startOfWeekToFetch={startOfWeekToFetch}
            todayDate={todayDate}
          />
        ))}
      </Swiper>
    </>
  );
}

type WeekDataProps = {
  todayDate: Date;
  profile: Profile;
  startOfWeekToFetch: Date;
};

function WeekData({ todayDate, profile, startOfWeekToFetch }: WeekDataProps) {
  const startOfWeekToFetchString = startOfWeekToFetch.toISOString();
  const endOfWeekToFetch = addWeeks(startOfWeekToFetch, 1);
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

  const hasSomeDayOfThisWeek = isThisWeek(startOfWeekToFetch, {
    weekStartsOn: WeekDay.Monday,
  });

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
          : `${format(startOfWeekToFetch, "do' 'MMM")} - ${format(
              endOfWeekToFetch,
              "do' 'MMM"
            )}`}
      </Text>

      <View
        style={{
          flexDirection: "row",
          borderRadius: 5,
          alignItems: "center",
          marginTop: theme.spacing.sm,
          paddingHorizontal: 10,
        }}
      >
        <View style={{ width: theme.spacing.xl }} />

        <View
          style={{
            flex: 1,
            marginRight: theme.spacing.lg,
          }}
        >
          <Text style={{ fontFamily: "InterSemiBold", textAlign: "center" }}>
            Calories
          </Text>
        </View>

        <View
          style={{
            flex: 1,
          }}
        >
          <Text style={{ fontFamily: "InterSemiBold", textAlign: "center" }}>
            Weight
          </Text>
        </View>
      </View>

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
          <WeekDayData
            key={`${day}-${endOfWeekToFetchString}`}
            profile={profile}
            data={data}
            day={day}
            todayDate={todayDate}
            hasSomeDayOfThisWeek={hasSomeDayOfThisWeek}
          />
        ))}

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
                <Text>{averageKcal}</Text>
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
                <Text>{averageWeight}</Text>
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

type WeekDayDataProps = {
  profile: Profile;
  todayDate: Date;
  hasSomeDayOfThisWeek: boolean;
  day: WeekDay;
  data: {
    id: string;
    created_at: string;
    calories: number;
    weight: number;
  }[];
};

function WeekDayData({
  data,
  day,
  hasSomeDayOfThisWeek,
  todayDate,
  profile,
}: WeekDayDataProps) {
  const { theme } = useTheme();

  const dayData = data.find((entry) => {
    if (day === getDay(new Date(entry.created_at))) {
      return entry;
    }
  });

  const [calories, setCalories] = useState(dayData?.calories);
  const [weight, setWeight] = useState(dayData?.weight);

  const isDayToday = dayData
    ? isToday(new Date(dayData.created_at))
    : hasSomeDayOfThisWeek
    ? todayDate.getDay() === day
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
        paddingHorizontal: hasSomeDayOfThisWeek ? 10 : 0,
        borderRadius: 5,
        alignItems: "center",
      }}
    >
      <Text style={{ width: theme.spacing.xl }}>{weekDayName[0]}</Text>

      <TextInput
        onBlur={() => {
          // Update
        }}
        onChangeText={(text) => setCalories(Number(text))}
        value={calories?.toString()}
        keyboardType="numeric"
        maxLength={5}
        style={{
          backgroundColor: theme.colors.grey5,
          color: theme.colors.black,
          flex: 1,
          fontFamily: "InterRegular",
          textAlign: "center",
          padding: 7,
          borderRadius: 5,
          marginRight: theme.spacing.lg,
        }}
      />

      <TextInput
        onBlur={() => {
          // Update
        }}
        onChangeText={(text) => setWeight(Number(text))}
        value={weight?.toString()}
        keyboardType="numeric"
        maxLength={6}
        style={{
          backgroundColor: theme.colors.grey5,
          color: theme.colors.black,
          flex: 1,
          fontFamily: "InterRegular",
          textAlign: "center",
          padding: 7,
          borderRadius: 5,
        }}
      />
    </View>
  );
}
