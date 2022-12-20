import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon, Text, useTheme } from "@rneui/themed";
import {
  StyleProp,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useState } from "react";

import {
  CompletedProfileStackParamList,
  FoodTabStackParamList,
} from "modules/common/types";
import { QuickAddRootScreen } from "./quick-add/root";
import { SearchTabScreen } from "./search/root";
import { BarcodeTabScreen } from "./barcode/root";

type Props = NativeStackScreenProps<CompletedProfileStackParamList, "Food">;

const FoodTabStack = createNativeStackNavigator<FoodTabStackParamList>();

export function FoodScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState(route.params.screen);

  const getTabStyles = (tab: keyof FoodTabStackParamList) => {
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
    };

    const iconColor = isSelected ? theme.colors.black : theme.colors.grey4;

    return {
      tab: tabStyles,
      text: tabTextStyles,
      iconColor,
    };
  };

  const [barcodeTabStyles, quickAddTabStyles, searchTabStyles] = [
    getTabStyles("Barcode"),
    getTabStyles("QuickAdd"),
    getTabStyles("Search"),
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
          style={[barcodeTabStyles.tab, { paddingLeft: theme.spacing.md }]}
          onPress={() => {
            navigation.navigate("Food", { screen: "Barcode" });
          }}
        >
          <Icon
            type="material-community"
            name="barcode-scan"
            size={20}
            color={barcodeTabStyles.iconColor}
          />
          <Text style={barcodeTabStyles.text}>Barcode</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={searchTabStyles.tab}
          onPress={() => {
            navigation.navigate("Food", { screen: "Search" });
          }}
        >
          <Icon
            type="material"
            name="search"
            size={20}
            color={searchTabStyles.iconColor}
          />
          <Text style={searchTabStyles.text}>Search</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[quickAddTabStyles.tab, { paddingRight: theme.spacing.md }]}
          onPress={() => {
            navigation.navigate("Food", { screen: "QuickAdd" });
          }}
        >
          <Icon
            type="material"
            name="playlist-add"
            size={20}
            color={quickAddTabStyles.iconColor}
          />
          <Text style={quickAddTabStyles.text}>Quick Add</Text>
        </TouchableOpacity>
      </View>

      <FoodTabStack.Navigator
        initialRouteName="Barcode"
        screenOptions={{ animation: "none" }}
        screenListeners={{
          focus: ({ target }) => {
            if (target) {
              setSelectedTab(
                target.split("-")[0] as keyof FoodTabStackParamList
              );
            }
          },
        }}
      >
        <FoodTabStack.Screen
          name="Barcode"
          component={BarcodeTabScreen}
          options={{
            headerShown: false,
          }}
        />
        <FoodTabStack.Screen
          name="Search"
          component={SearchTabScreen}
          options={{
            headerShown: false,
          }}
        />
        <FoodTabStack.Screen
          name="QuickAdd"
          component={QuickAddRootScreen}
          options={{
            headerShown: false,
          }}
        />
      </FoodTabStack.Navigator>
    </SafeAreaView>
  );
}
