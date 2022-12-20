import { useTheme } from "@rneui/themed";
import { useState } from "react";
import { StyleProp, TextStyle, ViewStyle } from "react-native";

interface UseTabs<TabType> {
  initialSelectedTab: TabType;
}

export function useTabs<TabType>({ initialSelectedTab }: UseTabs<TabType>) {
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState(initialSelectedTab);

  const getTabStyles = (tab: TabType) => {
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

  return { getTabStyles, selectedTab, setSelectedTab };
}
