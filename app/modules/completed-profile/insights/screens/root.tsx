import { SafeAreaView } from "react-native-safe-area-context";
import { Icon, Text, useTheme } from "@rneui/themed";
import {
  ScrollView,
  StyleProp,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import {
  CompletedProfileStackParamList,
  InsightsStackParamList,
} from "modules/common/types";
import { useState } from "react";
import { EnergyExpenditureScreen } from "./energy-expenditure/root";
import { WeightScreen } from "./weight/root";

type Props = NativeStackScreenProps<CompletedProfileStackParamList, "Insights">;

const InsightsTabStack = createNativeStackNavigator<InsightsStackParamList>();

export function InsightsScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState(route.params.screen);

  const getTabStyles = (tab: keyof InsightsStackParamList) => {
    const isSelected = tab === selectedTab;

    const tabStyles: StyleProp<ViewStyle> = {
      flex: 1,
      borderBottomWidth: 1,
      borderBottomColor: isSelected ? theme.colors.black : theme.colors.grey4,
      alignItems: "center",
      paddingBottom: 15,
      flexDirection: "row",
      justifyContent: "center",
    };

    const tabTextStyles: StyleProp<TextStyle> = {
      fontSize: 13,
      marginLeft: 7,
      color: isSelected ? theme.colors.black : theme.colors.grey4,
      fontFamily: "InterBold",
    };

    const iconColor = isSelected ? theme.colors.black : theme.colors.grey4;

    return {
      tab: tabStyles,
      text: tabTextStyles,
      iconColor,
    };
  };

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
