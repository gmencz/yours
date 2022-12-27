import { makeStyles } from "@rneui/themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { WeeksSwiper } from "~/components/WeeksSwiper";

export function HomeScreen() {
  const styles = useStyles();

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <WeeksSwiper />
    </SafeAreaView>
  );
}

const useStyles = makeStyles((theme) => ({
  safeAreaView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
}));
