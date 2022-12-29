import { makeStyles, Skeleton, Text, useTheme } from "@rneui/themed";
import { QueryKey } from "@tanstack/react-query";
import { getDay, isToday, setDay } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { Profile } from "~/hooks/useProfileQuery";
import { WeekDayCaloriesAndWeightData } from "~/hooks/useWeekCaloriesAndWeightsQuery";
import { useWeekDayMutation } from "~/hooks/useWeekDayMutation";
import { WeekDay, weekDaysWithNames } from "~/typings";

interface WeekDayCaloriesAndWeightProps {
  weekCaloriesAndWeights?: WeekDayCaloriesAndWeightData[];
  day: WeekDay;
  profile: Profile;
  startOfWeekDate: Date;
  endOfWeekDate: Date;
  queryKey: QueryKey;
  isThisWeek: boolean;
  todayDate: Date;
  weightUnit: string;
  isLoading: boolean;
}

export function WeekDayCaloriesAndWeight({
  weekCaloriesAndWeights,
  profile,
  startOfWeekDate,
  endOfWeekDate,
  day,
  queryKey,
  isThisWeek,
  todayDate,
  weightUnit,
  isLoading,
}: WeekDayCaloriesAndWeightProps) {
  const { theme } = useTheme();
  const weekDayName = weekDaysWithNames[day];
  const savedCaloriesAndWeight = useMemo(
    () =>
      weekCaloriesAndWeights?.find((entry) => {
        if (day === getDay(new Date(entry.created_at))) {
          return entry;
        }
      }),

    [day, weekCaloriesAndWeights]
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

  const createdAtDate = useMemo(() => {
    if (savedCaloriesAndWeight?.created_at) {
      return new Date(savedCaloriesAndWeight.created_at);
    } else {
      if (day === WeekDay.Sunday) {
        return endOfWeekDate;
      } else {
        return setDay(startOfWeekDate, day);
      }
    }
  }, [savedCaloriesAndWeight, endOfWeekDate, startOfWeekDate, day]);

  const mutation = useWeekDayMutation({
    profile,
    createdAtDateString: createdAtDate.toISOString(),
    savedCaloriesAndWeight,
    queryKey,
  });

  const todayDay = getDay(todayDate);

  const isDayToday = savedCaloriesAndWeight
    ? isToday(new Date(savedCaloriesAndWeight.created_at))
    : isThisWeek
    ? todayDay === day
    : false;

  const isAfterToday = isThisWeek
    ? todayDay === WeekDay.Sunday
      ? false
      : day > todayDay || day === WeekDay.Sunday
    : false;

  const isDisabled = isAfterToday;
  const styles = useStyles({ isDayToday, isDisabled, isThisWeek });

  return (
    <View style={styles.container}>
      <Text style={styles.dayLetter}>{weekDayName[0]}</Text>

      {isLoading ? (
        <Skeleton style={styles.caloriesSkeleton} height={42.5} />
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
          disabled={isDisabled}
          onPress={() => {
            setEditingCalories(true);
          }}
        >
          {calories ? <Text style={styles.text}>{calories} kcal</Text> : null}
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
          disabled={isDisabled}
          onPress={() => {
            setEditingWeight(true);
          }}
        >
          {weight ? (
            <Text style={styles.text}>
              {weight} {weightUnit}
            </Text>
          ) : null}
        </TouchableOpacity>
      )}
    </View>
  );
}

interface UseStylesProps {
  isDisabled: boolean;
  isThisWeek: boolean;
  isDayToday: boolean;
}

const useStyles = makeStyles((theme, props: UseStylesProps) => ({
  container: {
    flexDirection: "row",
    borderWidth: props.isDayToday ? 1 : 0,
    borderColor: theme.colors.black,
    paddingVertical: 10,
    paddingHorizontal: props.isThisWeek ? 10 : 0,
    borderRadius: 5,
    alignItems: "center",
  },

  text: {
    textAlign: "center",
  },

  dayLetter: {
    width: theme.spacing.xl,
  },

  caloriesSkeleton: {
    backgroundColor: theme.colors.grey5,
    flex: 1,
    borderRadius: 5,
    marginRight: theme.spacing.lg,
  },

  weightSkeleton: {
    backgroundColor: theme.colors.grey5,
    flex: 1,
    borderRadius: 5,
  },

  inputOrPressable: {
    backgroundColor: props.isDisabled ? theme.colors.grey4 : theme.colors.grey5,
    flex: 1,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    height: 42.5,
    flexDirection: "row",
    textAlign: "center",
    color: theme.colors.black,
  },
}));
