import { ScrollView, StyleSheet } from "react-native";
import Meals from "./meals";
import Summary from "./summary";

export default function Home() {
  return (
    <ScrollView style={styles.container}>
      <Summary />
      <Meals />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 70,
    paddingLeft: 30,
    paddingRight: 30,
    display: "flex",
  },
});
