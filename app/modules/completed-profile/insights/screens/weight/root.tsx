import { Skeleton, Text, useTheme, useThemeMode } from "@rneui/themed";
import { useQuery } from "@tanstack/react-query";
import { useProfileQuery } from "modules/auth/hooks/use-profile-query";
import { Heading1, Heading2 } from "modules/common/components/headings";
import { hexToRGBA } from "modules/common/utils/hex-to-rgba";
import { supabase } from "modules/supabase/client";
import { Dimensions, ScrollView, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { smoothOutWeights } from "../../utils/smooth-out-weights";
import { format, subMonths, subWeeks, subYears } from "date-fns";
import { Button } from "modules/common/components/button";
import { Dispatch, SetStateAction, useState } from "react";

type WeightsQueryData = {
  weight: number;
  created_at: string;
}[];

interface From {
  createdAt: Date;
  period: "1W" | "1M" | "3M" | "6M" | "1Y";
}

export function WeightScreen() {
  const { theme } = useTheme();
  const { data: profile } = useProfileQuery();
  const [from, setFrom] = useState<From>({
    createdAt: subWeeks(new Date(), 1),
    period: "1W",
  });

  const fromCreatedAtString = from.createdAt.toISOString();

  const {
    data: weights,
    isLoading,
    isError,
  } = useQuery({
    keepPreviousData: true,
    queryKey: ["weights", fromCreatedAtString],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles_calories_and_weights")
        .select<string, WeightsQueryData[0]>("weight, created_at")
        .eq("profile_id", profile!.id)
        .not("weight", "is", "null")
        .gte("created_at", fromCreatedAtString)
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
        paddingVertical: theme.spacing.xl,
      }}
    >
      <View style={{ paddingHorizontal: theme.spacing.xl }}>
        <Heading1>Weight</Heading1>
        <Heading2 style={{ marginTop: theme.spacing.sm }}>
          Data based on daily weigh-ins over time
        </Heading2>
      </View>

      <View style={{ marginTop: theme.spacing.lg }}>
        {isLoading ? (
          <View style={{ paddingHorizontal: theme.spacing.xl }}>
            <Skeleton height={42.5} />
            <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
            <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
            <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
            <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
            <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
            <Skeleton height={42.5} style={{ marginTop: theme.spacing.lg }} />
          </View>
        ) : isError ? (
          <Text
            style={{
              color: theme.colors.error,
              paddingHorizontal: theme.spacing.xl,
            }}
          >
            Something went wrong calculating your weight trend.
          </Text>
        ) : (
          <Graph weights={weights} from={from} setFrom={setFrom} />
        )}
      </View>
    </ScrollView>
  );
}

interface GraphProps {
  weights: WeightsQueryData;
  from: From;
  setFrom: Dispatch<SetStateAction<From>>;
}

const GRAPH_YELLOW = "#FFCD00";

function getLabels(weights: WeightsQueryData) {
  // Create a new array with the same length as the input data
  const labels: string[] = new Array(weights.length).fill("");

  // Set the first and last items to their original values
  labels[0] = format(new Date(weights[0].created_at), "MMM' 'd");
  labels[weights.length - 1] = format(
    new Date(weights[weights.length - 1].created_at),
    "MMM' 'd"
  );

  // Calculate the distance between the items to be preserved
  const interval = Math.floor(weights.length / 3);

  // Set the items in between the first and last to their original values
  for (let i = interval; i < weights.length - interval; i += interval) {
    labels[i] = format(new Date(weights[i].created_at), "MMM' 'd");
  }

  return labels;
}

// TODO: Animate graph
function Graph({ weights, from, setFrom }: GraphProps) {
  const { theme } = useTheme();
  const scaleWeights = weights.map(({ weight }) => weight);
  const smoothedWeights = smoothOutWeights(scaleWeights, { pad: true });
  const labels = getLabels(weights);

  return (
    <View>
      <View
        style={{
          paddingHorizontal: theme.spacing.xl,
          flexDirection: "row",
          marginTop: theme.spacing.md,
          marginBottom: theme.spacing.xl,
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginRight: theme.spacing.xl,
          }}
        >
          <View
            style={{
              width: 45,
              height: 10,
              backgroundColor: theme.colors.primary,
              borderRadius: 10,
              marginRight: theme.spacing.md,
            }}
          />
          <Text style={{ color: theme.colors.grey0, fontSize: 13 }}>
            Weight Trend
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 40,
              height: 10,
              backgroundColor: GRAPH_YELLOW,
              borderRadius: 10,
              marginRight: theme.spacing.md,
            }}
          />
          <Text style={{ color: theme.colors.grey0, fontSize: 13 }}>
            Scale Weight
          </Text>
        </View>
      </View>

      <LineChart
        style={{ marginHorizontal: -14 }}
        data={{
          labels,
          datasets: [
            {
              data: smoothedWeights,
              strokeWidth: 2,
              color: () => hexToRGBA(theme.colors.primary, 1),
            },
            {
              data: scaleWeights,
              strokeWidth: 2,
              color: () => hexToRGBA(GRAPH_YELLOW, 1),
            },
          ],
        }}
        width={Dimensions.get("window").width}
        height={300}
        withDots={false}
        withShadow={false}
        transparent
        yAxisInterval={3}
        bezier
        chartConfig={{
          color: (opacity = 1) => hexToRGBA(theme.colors.black, opacity),
          decimalPlaces: 1,
        }}
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Button
          small
          title="1W"
          onPress={() => {
            setFrom({
              createdAt: subWeeks(new Date(), 1),
              period: "1W",
            });
          }}
          variant={from.period === "1W" ? "1" : "2"}
          style={{ width: 50, borderRadius: 30, marginRight: theme.spacing.lg }}
        />
        <Button
          small
          title="1M"
          onPress={() => {
            setFrom({
              createdAt: subMonths(new Date(), 1),
              period: "1M",
            });
          }}
          variant={from.period === "1M" ? "1" : "2"}
          style={{ width: 50, borderRadius: 30, marginRight: theme.spacing.lg }}
        />
        <Button
          small
          title="3M"
          onPress={() => {
            setFrom({
              createdAt: subMonths(new Date(), 3),
              period: "3M",
            });
          }}
          variant={from.period === "3M" ? "1" : "2"}
          style={{ width: 50, borderRadius: 30, marginRight: theme.spacing.lg }}
        />
        <Button
          small
          title="6M"
          onPress={() => {
            setFrom({
              createdAt: subMonths(new Date(), 6),
              period: "6M",
            });
          }}
          variant={from.period === "6M" ? "1" : "2"}
          style={{ width: 50, borderRadius: 30, marginRight: theme.spacing.lg }}
        />
        <Button
          small
          title="1Y"
          onPress={() => {
            setFrom({
              createdAt: subYears(new Date(), 1),
              period: "1Y",
            });
          }}
          variant={from.period === "1Y" ? "1" : "2"}
          style={{ width: 50, borderRadius: 30 }}
        />
      </View>
    </View>
  );
}
