import { makeStyles, Text, useTheme } from "@rneui/themed";
import { format } from "date-fns";
import { Dispatch, SetStateAction } from "react";
import { Dimensions, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { WeightsQueryData } from "~/hooks/useWeightsQuery";
import { Period } from "~/screens/Insights/Weight";
import { formatDecimal } from "~/utils/formatDecimal";
import { hexToRgba } from "~/utils/hexToRgba";
import { smoothOutWeights } from "~/utils/smoothOutWeights";
import { Button } from "./Button";

interface GraphProps {
  weights: WeightsQueryData;
  period: Period;
  setPeriod: Dispatch<SetStateAction<Period>>;
}

function formatCreatedAt(s: string) {
  return format(new Date(s), "MMM' 'd");
}

function getGraphLabels(weights: WeightsQueryData) {
  if (weights.length <= 4) {
    return weights.map((w) => formatCreatedAt(w.created_at));
  }

  // Create a new array with the same length as the input data
  const labels: string[] = new Array(weights.length).fill("");

  // Set the first and last items to their original values
  labels[0] = formatCreatedAt(weights[0].created_at);

  let lastIndex = weights.length - 1;
  if (weights.length > 7) {
    lastIndex = weights.length - 2;
  }

  labels[lastIndex] = formatCreatedAt(weights[weights.length - 1].created_at);

  // Calculate the distance between the items to be preserved
  const interval = Math.floor(
    weights.length % 3 === 0 ? (weights.length - 1) / 3 : weights.length / 3
  );

  // Set the items in between the first and last to their original values
  for (let i = interval; i < weights.length - interval; i += interval) {
    labels[i] = formatCreatedAt(weights[i].created_at);
  }

  return labels;
}

export function WeightsGraph({ weights, period, setPeriod }: GraphProps) {
  const { theme } = useTheme();
  const scaleWeights = weights.map(({ weight }) => weight);
  const smoothedWeights = smoothOutWeights(scaleWeights, { pad: true });
  const labels = getGraphLabels(weights);
  const styles = useStyles();
  const width = Dimensions.get("screen").width - theme.spacing.xl;

  return (
    <>
      <View style={styles.container}>
        <View style={styles.trendLegendContainer}>
          <View style={styles.trendLegendRect} />
          <Text style={styles.legendText}>Weight Trend</Text>
        </View>

        <View style={styles.scaleLegendContainer}>
          <View style={styles.scaleLegendRect} />
          <Text style={styles.legendText}>Scale Weight</Text>
        </View>
      </View>

      <LineChart
        style={styles.chart}
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
              color: () => hexToRgba(theme.colors.secondary, 1),
            },
          ],
        }}
        width={width}
        height={300}
        withDots={false}
        withShadow={false}
        transparent
        bezier
        formatYLabel={(value) => formatDecimal(Number(value))}
        chartConfig={{
          color: (opacity = 1) => hexToRgba(theme.colors.black, opacity),
          decimalPlaces: 1,
          propsForLabels: {
            fontFamily: "SoraRegular",
          },
        }}
      />

      <View style={styles.buttonsContainer}>
        <Button
          small
          title="1W"
          onPress={() => {
            setPeriod("1W");
          }}
          variant={period === "1W" ? "1" : "2"}
          style={[{ marginRight: theme.spacing.lg }]}
        />
        <Button
          small
          title="1M"
          onPress={() => {
            setPeriod("1M");
          }}
          variant={period === "1M" ? "1" : "2"}
          style={[{ marginRight: theme.spacing.lg }]}
        />
        <Button
          small
          title="3M"
          onPress={() => {
            setPeriod("3M");
          }}
          variant={period === "3M" ? "1" : "2"}
          style={[{ marginRight: theme.spacing.lg }]}
        />
        <Button
          small
          title="6M"
          onPress={() => {
            setPeriod("6M");
          }}
          variant={period === "6M" ? "1" : "2"}
          style={[{ marginRight: theme.spacing.lg }]}
        />
        <Button
          small
          title="1Y"
          onPress={() => {
            setPeriod("1Y");
          }}
          variant={period === "1Y" ? "1" : "2"}
        />
      </View>
    </>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.xl,
    flexDirection: "row",
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    alignItems: "center",
  },

  trendLegendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: theme.spacing.xl,
  },

  noWeightsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  scaleLegendContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  legendText: {
    fontSize: 13,
  },

  trendLegendRect: {
    width: 40,
    height: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    marginRight: theme.spacing.md,
  },

  scaleLegendRect: {
    width: 40,
    height: 10,
    backgroundColor: theme.colors.secondary,
    borderRadius: 10,
    marginRight: theme.spacing.md,
  },

  chart: {
    marginHorizontal: -7,
  },

  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
}));
