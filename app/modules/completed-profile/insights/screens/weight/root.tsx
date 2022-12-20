import { Skeleton, Text, useTheme } from "@rneui/themed";
import { useQuery } from "@tanstack/react-query";
import { useProfileQuery } from "modules/auth/hooks/use-profile-query";
import { Heading1, Heading2 } from "modules/common/components/headings";
import { supabase } from "modules/supabase/client";
import { ScrollView, View } from "react-native";

type WeightsQueryData = {
  weight: number;
  created_at: string;
}[];

export function WeightScreen() {
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
        .select<string, WeightsQueryData[number]>("weight, created_at")
        .eq("profile_id", profile!.id)
        .not("weight", "is", "null")
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      return data;
    },
  });

  return (
    <ScrollView
      style={{
        backgroundColor: theme.colors.background,
        padding: theme.spacing.xl,
      }}
    >
      <View>
        <Heading1>Weight Trend</Heading1>
        <Heading2 style={{ marginTop: theme.spacing.sm }}>
          Trend based on daily weigh-ins over time
        </Heading2>
      </View>

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
          <Graph weights={weights} />
        )}
      </View>
    </ScrollView>
  );
}

interface GraphProps {
  weights: WeightsQueryData;
}

function Graph({ weights }: GraphProps) {
  const { theme } = useTheme();

  return (
    <>
      <Text>TODO</Text>
    </>
  );
}
