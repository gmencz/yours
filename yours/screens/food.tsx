import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthorizedStackParamList } from "../types";
import { Icon, Text, useTheme } from "@rneui/themed";
import { useState } from "react";
import {
  StyleProp,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { BarcodeTabScreen } from "../components/BarcodeTabScreen";
import { QuickAddTabScreen } from "../components/QuickAddTabScreen";
import { SearchTabScreen } from "../components/SearchTabScreen";

type Props = NativeStackScreenProps<AuthorizedStackParamList, "Food">;

type Tab = "barcode" | "search" | "quick-add";

export function FoodScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState<Tab>("barcode");

  const getTabStyles = (tab: Tab) => {
    const isSelected = tab === selectedTab;

    const tabStyles: StyleProp<ViewStyle> = {
      flex: 1,
      borderBottomWidth: isSelected ? 2 : 2,
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
    getTabStyles("barcode"),
    getTabStyles("quick-add"),
    getTabStyles("search"),
  ];

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingBottom: 30,
        paddingTop: 30,
      }}
    >
      <View
        style={{
          flexDirection: "row",
        }}
      >
        <TouchableOpacity
          style={[barcodeTabStyles.tab, { paddingLeft: theme.spacing.md }]}
          onPress={() => setSelectedTab("barcode")}
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
          onPress={() => setSelectedTab("search")}
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
          onPress={() => setSelectedTab("quick-add")}
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

      {selectedTab === "barcode" ? (
        <BarcodeTabScreen />
      ) : selectedTab === "quick-add" ? (
        <QuickAddTabScreen />
      ) : selectedTab === "search" ? (
        <SearchTabScreen />
      ) : null}
    </SafeAreaView>
  );
}
