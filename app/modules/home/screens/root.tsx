import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, useTheme } from "@rneui/themed";

import { AuthorizedStackParamList } from "types";
import {
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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
  setDay,
  startOfWeek,
  sub,
} from "date-fns";
import { Profile, useProfileQuery } from "modules/auth/hooks/use-profile-query";
import Swiper from "react-native-swiper";
import { PostgrestError } from "@supabase/supabase-js";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRef, useState } from "react";
import { formatDecimal } from "modules/common/utils/formatDecimal";

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

  const [loadedIndexes, setLoadedIndexes] = useState<Set<number>>(
    new Set([startOfWeeksToFetch.length - 1])
  );

  return (
    <>
      <Swiper
        loop={false}
        showsPagination={false}
        index={startOfWeeksToFetch.length - 1}
        onIndexChanged={(index) => {
          setLoadedIndexes((prev) => new Set(prev).add(index));
        }}
      >
        {startOfWeeksToFetch.map((startOfWeekToFetch, index) => (
          <WeekData
            key={startOfWeekToFetch.toISOString()}
            profile={profile}
            startOfWeekToFetch={startOfWeekToFetch}
            todayDate={todayDate}
            loadedIndexes={loadedIndexes}
            index={index}
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
  loadedIndexes: Set<number>;
  index: number;
};

// TODO: Organize everything this is shit

function WeekData({
  todayDate,
  profile,
  startOfWeekToFetch,
  loadedIndexes,
  index,
}: WeekDataProps) {
  const startOfWeekToFetchString = startOfWeekToFetch.toISOString();
  const endOfWeekToFetch = addWeeks(startOfWeekToFetch, 1);
  const endOfWeekToFetchString = endOfWeekToFetch.toISOString();
  const { theme } = useTheme();
  const queryKey = ["weeklyCaloriesAndWeights", startOfWeekToFetchString];
  const { data, isLoading, isError, isSuccess } = useQuery({
    enabled: loadedIndexes.has(index),
    staleTime: Infinity,
    queryKey,
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
        >("id, created_at, calories, weight")
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

  const filteredCalories = data.filter(({ calories }) => !!calories);
  const averageCalories =
    filteredCalories.reduce((acc, entry) => acc + entry.calories, 0) /
    filteredCalories.length;

  const filteredWeight = data.filter(({ weight }) => !!weight);
  const averageWeight =
    filteredWeight.reduce((acc, entry) => acc + entry.weight, 0) /
    filteredWeight.length;

  const hasSomeDayOfThisWeek = isThisWeek(startOfWeekToFetch, {
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
        ].map((day) => (
          <WeekDayData
            queryKey={queryKey}
            key={`${day}-${endOfWeekToFetchString}`}
            data={data}
            day={day}
            todayDate={todayDate}
            hasSomeDayOfThisWeek={hasSomeDayOfThisWeek}
            weightUnit={weightUnit}
            profile={profile}
            startOfWeekDate={startOfWeekToFetch}
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

type WeekDayDataProps = {
  todayDate: Date;
  weightUnit: string;
  hasSomeDayOfThisWeek: boolean;
  day: WeekDay;
  profile: Profile;
  startOfWeekDate: Date;
  queryKey: QueryKey;
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
  weightUnit,
  profile,
  startOfWeekDate,
  queryKey,
}: WeekDayDataProps) {
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const dayData = data.find((entry) => {
    if (day === getDay(new Date(entry.created_at))) {
      return entry;
    }
  });

  const [calories, setCalories] = useState(
    dayData?.calories ? dayData.calories.toString() : undefined
  );

  const [weight, setWeight] = useState(
    dayData?.weight ? dayData.weight.toString() : undefined
  );

  const [editingCalories, setEditingCalories] = useState(false);
  const [editingWeight, setEditingWeight] = useState(false);

  const mutation = useMutation<
    {
      id: string;
      created_at: string;
      calories: number;
      weight: number;
    },
    PostgrestError,
    { column: "calories" | "weight"; value: number | null }
  >({
    mutationFn: async ({ column, value }) => {
      const { data, error } = await supabase
        .from("profiles_calories_and_weights")
        .upsert({
          id: dayData?.id,
          [column]: value,
          profile_id: profile.id,
          created_at: dayData
            ? dayData.created_at
            : setDay(startOfWeekDate, day),
        })
        .select<
          string,
          {
            id: string;
            created_at: string;
            calories: number;
            weight: number;
          }
        >("id, created_at, calories, weight")
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    onSuccess: (data) => {
      const queryData = queryClient.getQueryData<
        {
          id: string;
          created_at: string;
          calories: number;
          weight: number;
        }[]
      >(queryKey);

      if (queryData) {
        const isExisting = queryData.some((value) => data.id === value.id);
        if (isExisting) {
          queryClient.setQueryData(
            queryKey,
            queryData.map((value) => {
              if (data.id === value.id) {
                return data;
              }

              return value;
            })
          );
        } else {
          queryClient.setQueryData(queryKey, [...queryData, data]);
        }
      }
    },
  });

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

      {editingCalories ? (
        <TextInput
          autoFocus
          onBlur={() => {
            setEditingCalories(false);
            mutation.mutate({
              column: "calories",
              value: calories ? Number(calories) : null,
            });
          }}
          onChangeText={(text) => setCalories(text)}
          value={calories}
          keyboardType="numeric"
          maxLength={5}
          style={{
            backgroundColor: theme.colors.grey5,
            color: theme.colors.black,
            flex: 1,
            fontFamily: "InterRegular",
            textAlign: "center",
            borderRadius: 5,
            marginRight: theme.spacing.lg,
            height: 42.5,
          }}
        />
      ) : (
        <TouchableOpacity
          onPress={() => {
            setEditingCalories(true);
          }}
          style={{
            backgroundColor: theme.colors.grey5,
            flex: 1,
            borderRadius: 5,
            marginRight: theme.spacing.lg,
            alignItems: "center",
            justifyContent: "center",
            height: 42.5,
          }}
        >
          {calories ? (
            <Text style={{ textAlign: "center" }}>{calories} kcal</Text>
          ) : null}
        </TouchableOpacity>
      )}

      {editingWeight ? (
        <TextInput
          autoFocus
          onBlur={() => {
            setEditingWeight(false);
            mutation.mutate({
              column: "weight",
              value: weight ? Number(weight) : null,
            });
          }}
          onChangeText={(text) => setWeight(text)}
          value={weight}
          keyboardType="numeric"
          maxLength={6}
          style={{
            backgroundColor: theme.colors.grey5,
            flex: 1,
            borderRadius: 5,
            height: 42.5,
            color: theme.colors.black,
            fontFamily: "InterRegular",
            textAlign: "center",
          }}
        />
      ) : (
        <TouchableOpacity
          onPress={() => {
            setEditingWeight(true);
          }}
          style={{
            backgroundColor: theme.colors.grey5,
            flex: 1,
            borderRadius: 5,
            alignItems: "center",
            justifyContent: "center",
            height: 42.5,
            flexDirection: "row",
          }}
        >
          {weight ? (
            <Text style={{ textAlign: "center" }}>
              {weight} {weightUnit}
            </Text>
          ) : null}
        </TouchableOpacity>
      )}
    </View>
  );
}
