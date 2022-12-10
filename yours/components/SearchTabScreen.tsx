import { yupResolver } from "@hookform/resolvers/yup";
import { Icon, Text, useTheme, useThemeMode } from "@rneui/themed";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { TextInput, View } from "react-native";
import * as yup from "yup";
import { useDebounce } from "../lib/use-debounce";
import { supabase } from "../lib/supabase";
import { FoodCard, FoodCardProps } from "./FoodCard";
import { useQuery } from "@tanstack/react-query";

type FormValues = {
  query: string;
};

const schema = yup
  .object({
    query: yup.string().required("Please enter a query"),
  })
  .required();

export function SearchTabScreen() {
  const { theme } = useTheme();
  const { mode } = useThemeMode();
  const [isInputFocused, setIsInputFocused] = useState(false);
  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const query = watch("query");
  const debouncedQuery = useDebounce<string>(query, 500);

  const {
    data: foods,
    error,
    isFetching: isSearching,
  } = useQuery({
    queryKey: ["searchResults", debouncedQuery],
    enabled: !!debouncedQuery,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("foods")
        .select<string, FoodCardProps["food"]>(
          `
        id,
        name,
        brand,
        photo,
        foods_nutrition_facts (
          values_per,
          calories,
          total_fat,
          carbs,
          protein
        )
      `
        )
        .textSearch("fts", debouncedQuery);

      if (error) {
        throw error;
      }

      return data;
    },
  });

  const backgroundColor =
    mode === "dark" ? "rgba(25, 25, 25, 1)" : "rgba(230, 230, 230, 1)";

  return (
    <View
      style={{
        marginTop: theme.spacing.xl,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderRadius: 100,
          paddingVertical: 10,
          paddingHorizontal: 15,
          backgroundColor,
          borderWidth: 1,
          borderColor: isInputFocused ? theme.colors.grey3 : backgroundColor,
          marginHorizontal: theme.spacing.lg,
        }}
      >
        <Icon
          type="material"
          name="search"
          size={25}
          color={theme.colors.grey1}
        />
        <Controller
          control={control}
          name="query"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Search for a food"
              onBlur={() => {
                onBlur();
                setIsInputFocused(false);
              }}
              onChangeText={onChange}
              value={value}
              placeholderTextColor={theme.colors.grey3}
              onFocus={() => setIsInputFocused(true)}
              style={{
                marginLeft: theme.spacing.md,
                color: theme.colors.black,
                flex: 1,
                fontFamily: "InterRegular",
              }}
            />
          )}
        />
      </View>

      <View
        style={{
          marginTop: theme.spacing.xl,
        }}
      >
        {error ? (
          <Text
            style={{
              color: theme.colors.error,
              marginBottom: theme.spacing.xl,
              paddingHorizontal: theme.spacing.xl,
            }}
          >
            There was an error searching for foods, try again later.
          </Text>
        ) : isSearching ? (
          <Text
            style={{
              color: theme.colors.grey4,
              marginBottom: theme.spacing.xl,
              paddingHorizontal: theme.spacing.xl,
            }}
          >
            Searching...
          </Text>
        ) : foods?.length ? (
          <>
            {foods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </>
        ) : (
          <Text
            style={{
              marginBottom: theme.spacing.xl,
              paddingHorizontal: theme.spacing.xl,
            }}
          >
            We found no results for your search
          </Text>
        )}
      </View>
    </View>
  );
}
