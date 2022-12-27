import { makeStyles, useTheme } from "@rneui/themed";
import { useState } from "react";

interface UseTabs<TabType> {
  initialSelectedTab: TabType;
}

export function useTabs<TabType>({ initialSelectedTab }: UseTabs<TabType>) {
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState(initialSelectedTab);
  const styles = useStyles();

  const getTabStyles = (tab: TabType) => {
    const isSelected = tab === selectedTab;
    const iconColor = isSelected ? theme.colors.black : theme.colors.grey4;

    return {
      tab: isSelected ? styles.selectedTab : styles.tab,
      text: isSelected ? styles.selectedText : styles.text,
      iconColor,
    };
  };

  return { getTabStyles, selectedTab, setSelectedTab };
}

const useStyles = makeStyles((theme) => ({
  tab: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey4,
    alignItems: "center",
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "center",
  },

  selectedTab: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.black,
    alignItems: "center",
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "center",
  },

  text: {
    fontSize: 13,
    marginLeft: 7,
    color: theme.colors.grey4,
    fontFamily: "InterBold",
  },

  selectedText: {
    color: theme.colors.black,
  },
}));
