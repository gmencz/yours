import { Colors, Skeleton, Text, Theme, useTheme } from "@rneui/themed";
import { QueryKey, useQueryClient } from "@tanstack/react-query";
import { getDay, isToday } from "date-fns";
import { Profile } from "modules/auth/hooks/use-profile-query";
import { WeekDay, weekDaysWithNames } from "modules/common/types";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { WeekDayCaloriesAndWeightData } from "../hooks/use-week-calories-and-weights-query";
import { useWeekDayMutation } from "../hooks/use-week-day-mutation";

type WeekDayCaloriesAndWeightProps = {
  weekCaloriesAndWeights?: WeekDayCaloriesAndWeightData[];
  day: WeekDay;
  profile: Profile;
  startOfWeekDate: Date;
  queryKey: QueryKey;
  isThisWeek: boolean;
  todayDate: Date;
  weightUnit: string;
  isLoading: boolean;
};

export function WeekDayCaloriesAndWeight({
  weekCaloriesAndWeights,
  profile,
  startOfWeekDate,
  day,
  queryKey,
  isThisWeek,
  todayDate,
  weightUnit,
  isLoading,
}: WeekDayCaloriesAndWeightProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const queryClient = useQueryClient();
  const savedCaloriesAndWeight = useMemo(
    () =>
      weekCaloriesAndWeights?.find((entry) => {
        if (day === getDay(new Date(entry.created_at))) {
          return entry;
        }
      }),

    [weekCaloriesAndWeights]
  );

  const [calories, setCalories] = useState<string>();
  const [weight, setWeight] = useState<string>();

  const [editingCalories, setEditingCalories] = useState(false);
  const [editingWeight, setEditingWeight] = useState(false);

  useEffect(() => {
    if (savedCaloriesAndWeight?.calories) {
      setCalories(savedCaloriesAndWeight.calories.toString());
    }

    if (savedCaloriesAndWeight?.weight) {
      setWeight(savedCaloriesAndWeight.weight.toString());
    }
  }, [savedCaloriesAndWeight]);

  const mutation = useWeekDayMutation({
    day,
    profileId: profile.id,
    startOfWeekDate,
    savedCaloriesAndWeight,
    onSuccess: (data) => {
      const queryData =
        queryClient.getQueryData<WeekDayCaloriesAndWeightData[]>(queryKey);

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

          return;
        }

        queryClient.setQueryData(queryKey, [...queryData, data]);
      }
    },
  });

  const isDayToday = savedCaloriesAndWeight
    ? isToday(new Date(savedCaloriesAndWeight.created_at))
    : isThisWeek
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
        paddingHorizontal: isThisWeek ? 10 : 0,
        borderRadius: 5,
        alignItems: "center",
      }}
    >
      <Text style={{ width: theme.spacing.xl }}>{weekDayName[0]}</Text>

      {isLoading ? (
        <Skeleton
          style={{
            backgroundColor: theme.colors.grey5,
            flex: 1,
            borderRadius: 5,
            marginRight: theme.spacing.lg,
          }}
          height={42.5}
        />
      ) : editingCalories ? (
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
          style={[styles.inputOrPressable, { marginRight: theme.spacing.lg }]}
        />
      ) : (
        <TouchableOpacity
          style={[styles.inputOrPressable, { marginRight: theme.spacing.lg }]}
          onPress={() => {
            setEditingCalories(true);
          }}
        >
          {calories ? (
            <Text style={{ textAlign: "center" }}>{calories} kcal</Text>
          ) : null}
        </TouchableOpacity>
      )}

      {isLoading ? (
        <Skeleton
          style={{
            backgroundColor: theme.colors.grey5,
            flex: 1,
            borderRadius: 5,
          }}
          height={42.5}
        />
      ) : editingWeight ? (
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
          style={styles.inputOrPressable}
        />
      ) : (
        <TouchableOpacity
          style={styles.inputOrPressable}
          onPress={() => {
            setEditingWeight(true);
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

const getStyles = (
  theme: {
    colors: Colors;
  } & Theme
) =>
  StyleSheet.create({
    inputOrPressable: {
      backgroundColor: theme.colors.grey5,
      flex: 1,
      borderRadius: 5,
      alignItems: "center",
      justifyContent: "center",
      height: 42.5,
      flexDirection: "row",
      textAlign: "center",
      color: theme.colors.black,
    },
  });
