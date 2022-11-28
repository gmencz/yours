import { createTheme } from "@rneui/themed";

// Theme colors:
// #8A54E2 - main
// #ED44BC
// #FF5C8D
// #FF9065
// #FFC755
// #F9F871

export const theme = createTheme({
  components: {
    Text: {
      style: {
        fontFamily: "InterRegular",
      },
    },
  },

  darkColors: {
    primary: "#8A54E2",
    secondary: "#ED44BC",
    background: "#000000",
  },

  lightColors: {
    primary: "#8A54E2",
    secondary: "#ED44BC",
    background: "#FFFFFF",
  },

  mode: "dark",
});
