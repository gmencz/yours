import { Skeleton, Text, useTheme } from "@rneui/themed";
import { useQuery } from "@tanstack/react-query";
import { useProfileQuery } from "modules/auth/hooks/use-profile-query";
import { supabase } from "modules/supabase/client";
import { View } from "react-native";

export function WeightTrend() {
  const { theme } = useTheme();
  const { data: profile } = useProfileQuery();

  const {
    data: weights,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["weights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles_calories_and_weights")
        .select<
          string,
          {
            weight: number;
            created_at: string;
          }
        >("weight, created_at")
        .eq("profile_id", profile!.id)
        .not("weight", "is", "null")
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      return data;
    },
  });

  console.log(JSON.stringify({ weights }, null, 4));

  return (
    <View style={{ paddingHorizontal: theme.spacing.xl }}>
      <Text
        style={{ marginTop: theme.spacing.lg, fontFamily: "InterSemiBold" }}
      >
        Weight Trend
      </Text>

      <Text style={{ color: theme.colors.grey0 }}>
        Trend based on daily weigh-ins over time
      </Text>

      <View style={{ marginTop: theme.spacing.lg }}>
        {isLoading ? (
          <>
            <Skeleton height={42.5} />
            <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
            <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
          </>
        ) : isError ? (
          <Text style={{ color: theme.colors.error }}>
            Something went wrong calculating your weight trend.
          </Text>
        ) : (
          <Text>TODO</Text>
        )}
      </View>
    </View>
  );
}
