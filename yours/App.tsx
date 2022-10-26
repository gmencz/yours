import { StatusBar } from "expo-status-bar";
import { Animated, StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.dayHeading}>Today</Text>

      <View style={styles.calories}>
        <View style={{ display: "flex", flexDirection: "column" }}>
          <View
            style={{
              height: 15,
              width: "100%",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                height: 12,
                width: "100%",
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                opacity: 50,
                borderRadius: 10,
              }}
            ></View>

            <Animated.View style={styles.caloriesProgress} />
          </View>

          <View
            style={{
              marginTop: 5,
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: 23,
                textAlign: "center",
              }}
            >
              1000 / 2000
            </Text>
          </View>
        </View>

        <View
          style={{
            marginTop: 15,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: 5,
            paddingRight: 5,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#FFFFFF", textAlign: "center" }}>
              Protein
            </Text>
            <View
              style={{
                marginTop: 5,
                height: 5,
                width: "100%",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  height: 3,
                  width: "100%",
                  backgroundColor: "rgba(255, 255, 255, 0.5)",
                  opacity: 50,
                  borderRadius: 4,
                }}
              ></View>

              <Animated.View style={styles.caloriesProgress} />
            </View>
            <Text
              style={{
                color: "#ffffff",
                textAlign: "center",
                fontSize: 11,
                marginTop: 5,
              }}
            >
              90 / 180 g
            </Text>
          </View>

          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={{ color: "#FFFFFF", textAlign: "center" }}>Carbs</Text>
            <View
              style={{
                marginTop: 5,
                height: 5,
                width: "100%",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  height: 3,
                  width: "100%",
                  backgroundColor: "rgba(255, 255, 255, 0.5)",
                  opacity: 50,
                  borderRadius: 4,
                }}
              ></View>

              <Animated.View style={styles.caloriesProgress} />
            </View>
            <Text
              style={{
                color: "#ffffff",
                textAlign: "center",
                fontSize: 11,
                marginTop: 5,
              }}
            >
              90 / 180 g
            </Text>
          </View>

          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={{ color: "#FFFFFF", textAlign: "center" }}>Fat</Text>
            <View
              style={{
                marginTop: 5,
                height: 5,
                width: "100%",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  height: 3,
                  width: "100%",
                  backgroundColor: "rgba(255, 255, 255, 0.5)",
                  opacity: 50,
                  borderRadius: 4,
                }}
              ></View>

              <Animated.View style={styles.caloriesProgress} />
            </View>
            <Text
              style={{
                color: "#ffffff",
                textAlign: "center",
                fontSize: 11,
                marginTop: 5,
              }}
            >
              90 / 180 g
            </Text>
          </View>
        </View>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 60,
    paddingRight: 27.5,
    paddingLeft: 27.5,
  },

  caloriesProgress: {
    // @ts-expect-error
    ...StyleSheet.absoluteFill,
    backgroundColor: "#FFFFFF",
    width: "50%",
    borderRadius: 10,
  },

  dayHeading: {
    fontWeight: "bold",
    fontSize: 28,
  },

  calories: {
    backgroundColor: "#FF5D5D",
    marginTop: 12,
    borderRadius: 10,
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 16,
    paddingBottom: 16,
  },
});
