import { SafeAreaView } from "react-native-safe-area-context";
import { Skeleton, Text, useTheme, useThemeMode } from "@rneui/themed";
import { LineChart } from "react-native-chart-kit";
import { calculateWeightFluctuations } from "../utils/calculate-weight-fluctuations";
import { Dimensions, View } from "react-native";
import { useProfileQuery } from "modules/auth/hooks/use-profile-query";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "modules/supabase/client";

export function InsightsScreen() {
  const { theme } = useTheme();
  const { mode } = useThemeMode();

  const {
    data: weightFluctuations,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["weightFluctuations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles_calories_and_weights")
        .select<
          string,
          {
            weight: number;
          }
        >("weight")
        .eq("profile_id", profile!.id)
        .not("weight", "is", "null")
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      const weights = data.map(({ weight }) => weight);
      const fluctuations = calculateWeightFluctuations(weights);
      return fluctuations;
    },
  });

  const { data: profile } = useProfileQuery();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingVertical: theme.spacing.xl,
      }}
    >
      <View style={{ paddingHorizontal: theme.spacing.xl }}>
        <Text
          style={{
            fontFamily: "InterBold",
            fontSize: 20,
          }}
        >
          Insights
        </Text>

        <Text
          style={{ marginTop: theme.spacing.lg, fontFamily: "InterSemiBold" }}
        >
          Weight Trend
        </Text>

        <Text style={{ color: theme.colors.grey0 }}>
          Trend based on daily weigh-ins over time
        </Text>
      </View>

      {isLoading ? (
        <View
          style={{
            paddingHorizontal: theme.spacing.xl,
            marginVertical: theme.spacing.xl,
          }}
        >
          <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
          <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
          <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
        </View>
      ) : isError ? (
        <View
          style={{
            paddingHorizontal: theme.spacing.xl,
            marginVertical: theme.spacing.md,
          }}
        >
          <Text style={{ color: theme.colors.error }}>
            Something went wrong calculating your weight trend.
          </Text>
        </View>
      ) : (
        <View
          style={{
            marginVertical: theme.spacing.xl,
            paddingLeft: theme.spacing.xl - 5,
          }}
        >
          <LineChart
            data={{
              labels: [],
              datasets: [
                {
                  data: weightFluctuations,
                },
              ],
            }}
            width={Dimensions.get("screen").width - theme.spacing.xl * 2}
            height={350}
            yAxisSuffix={
              profile?.prefered_measurement_system === "imperial"
                ? " lbs"
                : " kg"
            }
            withVerticalLabels={false}
            withVerticalLines={false}
            transparent
            chartConfig={{
              decimalPlaces: 2, // optional, defaults to 2dp
              color: (opacity = 1) =>
                mode === "dark"
                  ? `rgba(255, 255, 255, ${opacity})`
                  : `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) =>
                mode === "dark"
                  ? `rgba(255, 255, 255, ${opacity})`
                  : `rgba(0, 0, 0, ${opacity})`,
              propsForDots: {
                r: "2",
                strokeWidth: "2",
                stroke: theme.colors.primary,
              },
            }}
            bezier
            style={{
              borderRadius: 16,
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
