import { yupResolver } from "@hookform/resolvers/yup";
import { Icon, Text, useTheme, useThemeMode } from "@rneui/themed";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, TextInput, View } from "react-native";
import * as yup from "yup";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDebounce } from "modules/common/hooks/use-debounce";
import { supabase } from "modules/supabase/client";
import { FoodCard, FoodCardProps } from "modules/food/components/result-card";

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
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const {
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
    isSuccess,
  } = useQuery({
    queryKey: ["searchResults", debouncedQuery],
    enabled: !!debouncedQuery,
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("foods")
        .select<string, FoodCardProps["food"]>(
          `
        id,
        name,
        brand,
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

  return (
    <ScrollView
      style={{
        paddingVertical: 30,
        backgroundColor: theme.colors.background,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderRadius: 100,
          paddingVertical: 10,
          paddingHorizontal: 15,
          backgroundColor: theme.colors.grey5,
          borderWidth: 1,
          borderColor: isSearchFocused
            ? theme.colors.grey1
            : theme.colors.grey5,
          marginHorizontal: theme.spacing.lg,
        }}
      >
        <Icon
          type="material"
          name="search"
          size={25}
          color={theme.colors.grey2}
        />
        <Controller
          control={control}
          name="query"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Search for a food"
              onFocus={() => {
                setIsSearchFocused(true);
              }}
              onBlur={() => {
                onBlur();
                setIsSearchFocused(false);
              }}
              onChangeText={onChange}
              value={value}
              placeholderTextColor={theme.colors.grey3}
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
        ) : isSuccess ? (
          foods?.length ? (
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
          )
        ) : null}
      </View>
    </ScrollView>
  );
}
