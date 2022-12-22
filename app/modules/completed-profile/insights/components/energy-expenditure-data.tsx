import { Text, useTheme } from "@rneui/themed";
import { format } from "date-fns";
import { hexToRgba } from "modules/common/utils/hex-to-rgba";
import { useMemo } from "react";
import { ScrollView, View } from "react-native";
import { EstimationsQueryData } from "../screens/energy-expenditure/root";
import { isClose } from "../utils/is-close";
import { GRAPH_YELLOW } from "./weights-graph";

interface ExpenditureDataProps {
  estimations: EstimationsQueryData;
}

export function ExpenditureData({ estimations }: ExpenditureDataProps) {
  const { theme } = useTheme();

  return (
    <>
      <View
        style={{
          marginTop: theme.spacing.lg,
          marginBottom: theme.spacing.xl,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text style={{ marginRight: "auto", fontSize: 12 }}>MED CONF</Text>

        {confidences.map((confidenceOpacity) => (
          <View
            key={confidenceOpacity}
            style={{
              height: 15,
              width: 15,
              backgroundColor: hexToRgba(GRAPH_YELLOW, confidenceOpacity),
              marginRight: theme.spacing.md,
              borderRadius: 5,
            }}
          />
        ))}

        <Text style={{ fontSize: 12, marginLeft: "auto" }}>HIGH CONF</Text>
      </View>

      <ScrollView
        style={{
          flex: 1,
        }}
      >
        {estimations.map((estimation, index) => (
          <ExpenditureDataItem
            key={estimation.id}
            estimation={estimation}
            estimations={estimations}
            index={index}
          />
        ))}
      </ScrollView>
    </>
  );
}

interface ExpenditureDataItemProps {
  estimations: EstimationsQueryData;
  estimation: EstimationsQueryData[number];
  index: number;
}

// The higher the number, the higher the confidence.
const confidences = [0.25, 0.5, 0.75, 1];

function ExpenditureDataItem({
  index,
  estimation,
  estimations,
}: ExpenditureDataItemProps) {
  const { theme } = useTheme();
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
    [estimation, estimations]
  );

  return (
    <View
      key={estimation.id}
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: theme.spacing.xl,
      }}
    >
      <View
        style={{
          height: 45,
          width: 45,
          backgroundColor: `rgba(255, 205, 0, ${confidence})`,
          marginRight: theme.spacing.lg,
          borderRadius: 5,
        }}
      />

      <View
        style={{
          borderBottomColor: theme.colors.grey4,
          flex: 1,
        }}
      >
        <Text>
          {format(
            new Date(estimation.date_of_first_estimated_item),
            "do' 'MMM"
          )}{" "}
          - {""}
          {format(new Date(estimation.date_of_last_estimated_item), "do' 'MMM")}
        </Text>

        <Text style={{ color: theme.colors.grey0 }}>
          {Math.round(estimation.estimation)} kcal/day
        </Text>
      </View>
    </View>
  );
}
