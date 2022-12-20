import { SafeAreaView } from "react-native-safe-area-context";
import { Icon, Text, useTheme } from "@rneui/themed";
import { TouchableOpacity, View } from "react-native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import {
  CompletedProfileStackParamList,
  InsightsStackParamList,
} from "modules/common/types";
import { EnergyExpenditureScreen } from "./energy-expenditure/root";
import { WeightScreen } from "./weight/root";
import { useTabs } from "modules/common/hooks/use-tabs";

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

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingVertical: theme.spacing.xl,
      }}
    >
      <View
        style={{
          flexDirection: "row",
        }}
      >
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
            size={25}
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
            size={20}
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
