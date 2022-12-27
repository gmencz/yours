import { makeStyles, Text, useTheme } from "@rneui/themed";
import { ScrollView, View } from "react-native";
import { EstimationsQueryData } from "~/hooks/useTdeeEstimatonsQuery";
import { hexToRgba } from "~/utils/hexToRgba";
import {
  confidences,
  ExpenditureDataItem,
  InitialExpenditureDataItem,
} from "./EnergyExpenditureDataItem";

interface ExpenditureDataProps {
  estimations: EstimationsQueryData;
}

export function ExpenditureData({ estimations }: ExpenditureDataProps) {
  const { theme } = useTheme();
  const styles = useStyles();

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.confidenceText}>MED CONF</Text>

        {confidences.map((confidenceOpacity) => (
          <View
            key={confidenceOpacity}
            style={[
              styles.confidenceBox,
              {
                backgroundColor: hexToRgba(
                  theme.colors.yellow,
                  confidenceOpacity
                ),
              },
            ]}
          />
        ))}

        <Text style={styles.confidenceText2}>HIGH CONF</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {estimations.map((estimation, index) => (
          <ExpenditureDataItem
            key={estimation.id}
            estimation={estimation}
            estimations={estimations}
            index={index}
          />
        ))}

        <InitialExpenditureDataItem />
      </ScrollView>
    </>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    flexDirection: "row",
    alignItems: "center",
  },

  confidenceBox: {
    height: 15,
    width: 15,
    marginRight: theme.spacing.md,
    borderRadius: 5,
  },

  confidenceText: {
    fontSize: 12,
    marginRight: "auto",
  },

  confidenceText2: {
    fontSize: 12,
    marginLeft: "auto",
  },

  scrollView: {
    flex: 1,
  },
}));
