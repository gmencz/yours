import { makeStyles, Text } from "@rneui/themed";
import { format } from "date-fns";
import { useMemo } from "react";
import { View } from "react-native";
import { useProfileQuery } from "~/hooks/useProfileQuery";
import { EstimationsQueryData } from "~/hooks/useTdeeEstimatonsQuery";
import { hexToRgba } from "~/utils/hexToRgba";
import { isClose } from "~/utils/isClose";

// The higher the number, the higher the confidence.
export const confidences = [0.25, 0.5, 0.75, 1];

interface ExpenditureDataItemProps {
  estimations: EstimationsQueryData;
  estimation: EstimationsQueryData[number];
  index: number;
}

export function InitialExpenditureDataItem() {
  const styles = useStyles({ confidence: confidences[0] });
  const { data: profile } = useProfileQuery();

  return (
    <View style={styles.container}>
      <View style={styles.opacityIndicatorBox} />

      <View style={styles.dataContainer}>
        <Text>Initial estimation</Text>

        <Text style={styles.caloriesText}>
          {Math.round(profile!.initialTdeeEstimation!)} kcal/day
        </Text>
      </View>
    </View>
  );
}

export function ExpenditureDataItem({
  index,
  estimation,
  estimations,
}: ExpenditureDataItemProps) {
  const confidence = useMemo(
    () =>
      [1, 2, 3].reduce((prevConfidence, confidenceIndex) => {
        if (
          estimations[index - confidenceIndex] &&
          isClose(
            estimation.estimation,
            estimations[index - confidenceIndex].estimation,
            50
          )
        ) {
          return confidences[confidenceIndex];
        }

        return prevConfidence;
      }, confidences[0]),
    [estimation.estimation, estimations, index]
  );

  const styles = useStyles({ confidence });

  return (
    <View style={styles.container}>
      <View style={styles.opacityIndicatorBox} />

      <View style={styles.dataContainer}>
        <Text>
          {format(
            new Date(estimation.date_of_first_estimated_item),
            "do' 'MMM"
          )}{" "}
          - {""}
          {format(new Date(estimation.date_of_last_estimated_item), "do' 'MMM")}
        </Text>

        <Text style={styles.caloriesText}>
          {Math.round(estimation.estimation)} kcal/day
        </Text>
      </View>
    </View>
  );
}

interface UseStylesProps {
  confidence: number;
}

const useStyles = makeStyles((theme, props: UseStylesProps) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },

  opacityIndicatorBox: {
    height: 45,
    width: 45,
    backgroundColor: hexToRgba(theme.colors.yellow, props.confidence),
    marginRight: theme.spacing.lg,
    borderRadius: 5,
  },

  caloriesText: {
    color: theme.colors.grey0,
  },

  dataContainer: {
    borderBottomColor: theme.colors.grey4,
    flex: 1,
  },
}));
