import { makeStyles, useTheme } from "@rneui/themed";
import { useState } from "react";
import { hexToRgba } from "~/utils/hexToRgba";

interface UseTabs<TabType> {
  initialSelectedTab: TabType;
}

export function useTabs<TabType>({ initialSelectedTab }: UseTabs<TabType>) {
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState(initialSelectedTab);
  const styles = useStyles();

  const getTabStyles = (tab: TabType) => {
    const isSelected = tab === selectedTab;
    const iconColor = isSelected ? theme.colors.grey0 : theme.colors.grey4;

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
    alignItems: "center",
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.grey4,
  },

  selectedTab: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.grey0,
  },

  text: {
    fontSize: 13,
    marginLeft: theme.spacing.md,
    color: theme.colors.grey4,
    fontFamily: "SoraBold",
  },

  selectedText: {
    fontSize: 13,
    marginLeft: theme.spacing.md,
    color: theme.colors.grey0,
    fontFamily: "SoraBold",
  },
}));
