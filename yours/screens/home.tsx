import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Shadow } from "react-native-shadow-2";
import Summary from "../features/home/components/summary";

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <Summary />

      <View style={{ marginTop: 30 }}>
        <Text
          style={{
            fontFamily: "InterBlack",
            fontSize: 22,
            marginBottom: 10,
            color: "#393939",
          }}
        >
          Meals
        </Text>

        <Shadow
          distance={3}
          startColor="rgba(0, 0, 0, 0.075)"
          offset={[3, 4]}
          style={{
            width: "100%",
            borderRadius: 10,
            marginBottom: 15,
          }}
        >
          <View
            style={{
              borderRadius: 10,
              backgroundColor: "#FFFFFF",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 15,
              paddingHorizontal: 20,
            }}
          >
            <Image
              style={{
                width: 40,
                height: 40,
              }}
              source={require("../assets/images/meals/breakfast.png")}
            />
            <Text
              style={{
                fontFamily: "InterBold",
                fontSize: 16,
                color: "#606060",
                marginLeft: 10,
              }}
            >
              Breakfast
            </Text>
            <Text
              style={{
                fontFamily: "InterBold",
                fontSize: 16,
                marginLeft: "auto",
                color: "#606060",
              }}
            >
              900 cal
            </Text>
          </View>
        </Shadow>

        <Shadow
          distance={3}
          startColor="rgba(0, 0, 0, 0.075)"
          offset={[3, 4]}
          style={{
            width: "100%",
            borderRadius: 10,
            marginBottom: 15,
          }}
        >
          <View
            style={{
              borderRadius: 10,
              backgroundColor: "#FFFFFF",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 15,
              paddingHorizontal: 20,
            }}
          >
            <Image
              style={{
                width: 40,
                height: 40,
              }}
              source={require("../assets/images/meals/lunch.png")}
            />
            <Text
              style={{
                fontFamily: "InterBold",
                fontSize: 16,
                color: "#606060",
                marginLeft: 10,
              }}
            >
              Lunch
            </Text>
            <Text
              style={{
                fontFamily: "InterBold",
                fontSize: 16,
                marginLeft: "auto",
                color: "#606060",
              }}
            >
              1100 cal
            </Text>
          </View>
        </Shadow>

        <Shadow
          distance={3}
          startColor="rgba(0, 0, 0, 0.075)"
          offset={[3, 4]}
          style={{
            width: "100%",
            marginBottom: 15,
            borderRadius: 10,
          }}
        >
          <View
            style={{
              borderRadius: 10,
              backgroundColor: "#FFFFFF",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 15,
              paddingHorizontal: 20,
            }}
          >
            <Image
              style={{
                width: 40,
                height: 40,
              }}
              source={require("../assets/images/meals/dinner.png")}
            />
            <Text
              style={{
                fontFamily: "InterBold",
                fontSize: 16,
                color: "#606060",
                marginLeft: 10,
              }}
            >
              Dinner
            </Text>
            <Text
              style={{
                fontFamily: "InterBold",
                fontSize: 16,
                marginLeft: "auto",
                color: "#606060",
              }}
            >
              600 cal
            </Text>
          </View>
        </Shadow>

        <Shadow
          distance={3}
          startColor="rgba(0, 0, 0, 0.075)"
          offset={[3, 4]}
          style={{
            width: "100%",
            borderRadius: 10,
          }}
        >
          <View
            style={{
              borderRadius: 10,
              backgroundColor: "#FFFFFF",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 15,
              paddingHorizontal: 20,
            }}
          >
            <Image
              style={{
                width: 40,
                height: 40,
              }}
              source={require("../assets/images/meals/snacks.png")}
            />
            <Text
              style={{
                fontFamily: "InterBold",
                fontSize: 16,
                color: "#606060",
                marginLeft: 10,
              }}
            >
              Snacks
            </Text>
            <Text
              style={{
                fontFamily: "InterBold",
                fontSize: 16,
                marginLeft: "auto",
                color: "#606060",
              }}
            >
              400 cal
            </Text>
          </View>
        </Shadow>
      </View>
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
  macrosContainer: {
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    borderRadius: 25,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#FF5D5D",
  },
});
