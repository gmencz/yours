import { Text, useTheme } from "@rneui/themed";
import { format } from "date-fns";
import { Button } from "modules/common/components/button";
import { themeColor3 } from "modules/common/utils/colors";
import { hexToRgba } from "modules/common/utils/hex-to-rgba";
import { Dispatch, SetStateAction } from "react";
import { Dimensions, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { WeightsQueryData } from "../hooks/use-weights-query";
import { Period } from "../screens/weight/root";
import { smoothOutWeights } from "../utils/smooth-out-weights";

interface GraphProps {
  weights: WeightsQueryData;
  period: Period;
  setPeriod: Dispatch<SetStateAction<Period>>;
}

function formatCreatedAt(s: string) {
  return format(new Date(s), "MMM' 'd");
}

function getLabels(weights: WeightsQueryData) {
  // Create a new array with the same length as the input data
  const labels: string[] = new Array(weights.length).fill("");

  // Set the first and last items to their original values
  labels[0] = formatCreatedAt(weights[0].created_at);
  labels[weights.length - 1] = formatCreatedAt(
    weights[weights.length - 1].created_at
  );

  // Calculate the distance between the items to be preserved
  const interval = Math.floor(weights.length / 3);

  // Set the items in between the first and last to their original values
  for (let i = interval; i < weights.length - interval; i += interval) {
    labels[i] = formatCreatedAt(weights[i].created_at);
  }

  return labels;
}

export const GRAPH_YELLOW = "#FFCD00";
export function WeightsGraph({ weights, period, setPeriod }: GraphProps) {
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
          <Text style={{ fontSize: 13 }}>Weight Trend</Text>
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
              backgroundColor: themeColor3,
              borderRadius: 10,
              marginRight: theme.spacing.md,
            }}
          />
          <Text style={{ fontSize: 13 }}>Scale Weight</Text>
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
              color: () => hexToRgba(theme.colors.primary, 1),
            },
            {
              data: scaleWeights,
              strokeWidth: 2,
              color: () => hexToRgba(themeColor3, 1),
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
          color: (opacity = 1) => hexToRgba(theme.colors.black, opacity),
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
            setPeriod("1W");
          }}
          variant={period === "1W" ? "1" : "2"}
          style={{ width: 50, borderRadius: 30, marginRight: theme.spacing.lg }}
        />
        <Button
          small
          title="1M"
          onPress={() => {
            setPeriod("1M");
          }}
          variant={period === "1M" ? "1" : "2"}
          style={{ width: 50, borderRadius: 30, marginRight: theme.spacing.lg }}
        />
        <Button
          small
          title="3M"
          onPress={() => {
            setPeriod("3M");
          }}
          variant={period === "3M" ? "1" : "2"}
          style={{ width: 50, borderRadius: 30, marginRight: theme.spacing.lg }}
        />
        <Button
          small
          title="6M"
          onPress={() => {
            setPeriod("6M");
          }}
          variant={period === "6M" ? "1" : "2"}
          style={{ width: 50, borderRadius: 30, marginRight: theme.spacing.lg }}
        />
        <Button
          small
          title="1Y"
          onPress={() => {
            setPeriod("1Y");
          }}
          variant={period === "1Y" ? "1" : "2"}
          style={{ width: 50, borderRadius: 30 }}
        />
      </View>
    </View>
  );
}
