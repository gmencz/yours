import { Colors, createTheme } from "@rneui/themed";

const sharedColors: Partial<Colors> = {
  primary: "#EEECA4",
  secondary: "#6860A4",
  secondary2: "#7C7987",
  secondary3: "#FF9065",
  secondary4: "#FFC755",
  secondary5: "#F9F871",
  yellow: "#FFCD00",
};

export const theme = createTheme({
  components: {
    Text: {
      style: {
        fontFamily: "SoraRegular",
      },
    },
  },

  darkColors: {
    ...sharedColors,
    background: "#18181b",
    white: "#18181b",
    black: "#FCFCFC",
    grey0: "#d4d4d8",
    grey1: "#a1a1aa",
    grey2: "#71717a",
    grey3: "#52525b",
    grey4: "#3f3f46",
    grey5: "#27272a",
    greyOutline: "#18181b",
  },

  lightColors: {
    ...sharedColors,
    background: "#FCFCFC",
    white: "#FCFCFC",
    black: "#18181b",
    grey0: "#27272a",
    grey1: "#3f3f46",
    grey2: "#52525b",
    grey3: "#71717a",
    grey4: "#a1a1aa",
    grey5: "#d4d4d8",
    greyOutline: "#e4e4e7",
  },

  mode: "dark",
});
