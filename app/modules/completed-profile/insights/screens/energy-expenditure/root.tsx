import { Skeleton, Text, useTheme } from "@rneui/themed";
import { useQuery } from "@tanstack/react-query";
import { useProfileQuery } from "modules/auth/hooks/use-profile-query";
import { Heading1, Heading2 } from "modules/common/components/headings";
import { supabase } from "modules/supabase/client";
import { ScrollView, View } from "react-native";
import { ExpenditureData } from "../../components/energy-expenditure-data";

export type EstimationsQueryData = {
  id: number;
  estimation: number;
  date_of_first_estimated_item: string;
  date_of_last_estimated_item: string;
}[];

export function EnergyExpenditureScreen() {
  const { theme } = useTheme();
  const { data: profile } = useProfileQuery();

  const {
    data: estimations,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tdeeEstimations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles_tdee_estimations")
        .select<string, EstimationsQueryData[number]>(
          "id, estimation, date_of_first_estimated_item, date_of_last_estimated_item"
        )
        .eq("profile_id", profile!.id)
        .order("date_of_last_estimated_item", { ascending: false });

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
      <Heading1>Energy Expenditure</Heading1>
      <Heading2 style={{ marginTop: theme.spacing.sm }}>
        The brighter the yellow is, the greater confidence we have in our
        estimate of your daily energy needs.
      </Heading2>

      <View style={{ marginTop: theme.spacing.lg }}>
        {isLoading ? (
          <>
            <Skeleton height={20} style={{ marginTop: theme.spacing.lg }} />
            <Skeleton height={40} style={{ marginTop: theme.spacing.xl }} />
            <Skeleton height={40} style={{ marginTop: theme.spacing.lg }} />
            <Skeleton height={40} style={{ marginTop: theme.spacing.lg }} />
            <Skeleton height={40} style={{ marginTop: theme.spacing.lg }} />
            <Skeleton height={40} style={{ marginTop: theme.spacing.lg }} />
          </>
        ) : isError ? (
          <Text style={{ color: theme.colors.error }}>
            Something went wrong calculating your expenditure.
          </Text>
        ) : (
          <ExpenditureData estimations={estimations} />
        )}
      </View>
    </ScrollView>
  );
}
