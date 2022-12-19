import { Skeleton, Text, useTheme } from "@rneui/themed";
import { useQuery } from "@tanstack/react-query";
import { useProfileQuery } from "modules/auth/hooks/use-profile-query";
import { supabase } from "modules/supabase/client";
import { View } from "react-native";

export function Expenditure() {
  const { theme } = useTheme();
  const { data: profile } = useProfileQuery();

  const {
    data: tdeeEstimations,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tdeeEstimations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles_tdee_estimations")
        .select<
          string,
          {
            estimation: number;
            date_of_last_estimated_item: string;
          }
        >("estimation, date_of_last_estimated_item")
        .eq("profile_id", profile!.id)
        .order("date_of_last_estimated_item", { ascending: true });

      if (error) {
        throw error;
      }

      return data;
    },
  });

  console.log(JSON.stringify({ tdeeEstimations }, null, 4));

  return (
    <View
      style={{
        paddingHorizontal: theme.spacing.xl,
        marginTop: theme.spacing.xl,
      }}
    >
      <Text
        style={{ marginTop: theme.spacing.lg, fontFamily: "InterSemiBold" }}
      >
        Expenditure
      </Text>

      <Text style={{ color: theme.colors.grey0 }}>
        Based on nutrition and weight changes over time
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
            Something went wrong calculating your expenditure.
          </Text>
        ) : (
          <Text>TODO</Text>
        )}
      </View>
    </View>
  );
}
