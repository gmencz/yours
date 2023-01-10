import { SafeAreaView } from "react-native-safe-area-context";
import { Icon, makeStyles, Text, useTheme } from "@rneui/themed";
import { TouchableOpacity, View } from "react-native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import {
  CompletedProfileStackParamList,
  InsightsStackParamList,
} from "~/typings";
import { useTabs } from "~/hooks/useTabs";
import { WeightScreen } from "./Weight";
import { EnergyExpenditureScreen } from "./EnergyExpenditure";

type Props = NativeStackScreenProps<CompletedProfileStackParamList, "Insights">;

const InsightsTabStack = createNativeStackNavigator<InsightsStackParamList>();

export function InsightsScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const { getTabStyles, setSelectedTab } = useTabs({
    initialSelectedTab: route.params.screen,
  });

  const [energyExpenditureStyles, weightStyles] = [
    getTabStyles("EnergyExpenditure"),
    getTabStyles("Weight"),
  ];

  const styles = useStyles();

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            energyExpenditureStyles.tab,
            { paddingLeft: theme.spacing.md },
          ]}
          onPress={() => {
            navigation.navigate("Insights", { screen: "EnergyExpenditure" });
          }}
        >
          <Icon
            type="material-community"
            name="fire"
            size={27.5}
            color={energyExpenditureStyles.iconColor}
          />
          <Text style={energyExpenditureStyles.text}>Expenditure</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={weightStyles.tab}
          onPress={() => {
            navigation.navigate("Insights", { screen: "Weight" });
          }}
        >
          <Icon
            type="font-awesome-5"
            name="weight"
            size={22.5}
            color={weightStyles.iconColor}
            style={{ marginRight: 5 }}
          />

          <Text style={weightStyles.text}>Weight</Text>
        </TouchableOpacity>
      </View>

      <InsightsTabStack.Navigator
        initialRouteName="EnergyExpenditure"
        screenOptions={{ animation: "none" }}
        screenListeners={{
          focus: ({ target }) => {
            if (target) {
              setSelectedTab(
                target.split("-")[0] as keyof InsightsStackParamList
              );
            }
          },
        }}
      >
        <InsightsTabStack.Screen
          name="EnergyExpenditure"
          component={EnergyExpenditureScreen}
          options={{
            headerShown: false,
          }}
        />
        <InsightsTabStack.Screen
          name="Weight"
          component={WeightScreen}
          options={{
            headerShown: false,
          }}
        />
      </InsightsTabStack.Navigator>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((theme) => ({
  safeAreaView: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.xl,
  },

  tabsContainer: {
    flexDirection: "row",
  },
}));
