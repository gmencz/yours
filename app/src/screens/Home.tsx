import { makeStyles } from "@rneui/themed";
import { View } from "react-native";
import { WeeksSwiper } from "~/components/WeeksSwiper";

export function HomeScreen() {
  const styles = useStyles();

  return (
    <View style={styles.safeAreaView}>
      <WeeksSwiper />
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  safeAreaView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
}));
