import { LinearGradient } from "expo-linear-gradient";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Shadow } from "react-native-shadow-2";
import { PencilSquareIcon as PencilIcon } from "react-native-heroicons/solid";

export default function HomeScreen() {
  const caloriesLeft = "3,150";

  return (
    <View style={styles.container}>
      <View
        style={{
          marginBottom: 10,
          display: "flex",
          flexDirection: "row",
          paddingRight: 5,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontFamily: "InterSemiBold",
            color: "#606060",
            fontSize: 22,
            marginRight: "auto",
          }}
        >
          Summary
        </Text>
        <PencilIcon
          color="#3E75AC"
          fill="#3E75AC"
          size={20}
          style={{ marginTop: 3 }}
        />
      </View>

      <Shadow
        distance={8}
        startColor="rgba(0, 0, 0, 0.27)"
        offset={[3, 4]}
        style={{
          width: "100%",
        }}
      >
        <LinearGradient
          colors={["#FF8A8A", "#FF7F7F", "#FF5D5D"]}
          // colors={["#7AFF7E", "#01BE08", "#008604"]}
          start={[0.0, 0.0]}
          end={[1.0, 1.0]}
          style={styles.macrosContainer}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontFamily: "InterBlack",
              fontSize: 12,
              letterSpacing: 1.5,
            }}
          >
            CALORIES LEFT
          </Text>
          <Text
            style={{
              color: "#FFFFFF",
              fontFamily: "InterBlack",
              fontSize: 36,
              textShadowColor: "rgba(0, 0, 0, 0.25)",
              textShadowRadius: 4,
              textShadowOffset: {
                height: 4,
                width: 0,
              },
            }}
          >
            {caloriesLeft}
          </Text>

          <View
            style={{
              height: 29,
              width: "100%",
              marginTop: 10,
            }}
          >
            <View
              style={{
                height: 28,
                width: "100%",
                backgroundColor: "#FA7979",
                opacity: 50,
                borderRadius: 10,
              }}
            />

            <Animated.View
              style={{
                // @ts-expect-error
                ...StyleSheet.absoluteFill,
                backgroundColor: "#9FEEA7",
                width: "40%",
                borderRadius: 10,
                zIndex: 3,
              }}
            />
            <Animated.View
              style={{
                // @ts-expect-error
                ...StyleSheet.absoluteFill,
                left: "30%", // 40% from previous bar -10% offset
                backgroundColor: "#A19FEE",
                width: "30%", // 20% + 10% from above -10%
                borderRadius: 10,
                zIndex: 2,
              }}
            />
            <Animated.View
              style={{
                // @ts-expect-error
                ...StyleSheet.absoluteFill,
                left: "50%",
                backgroundColor: "#EEE19F",
                width: "20%", // 10% + 10% from previous bar offset 10%
                borderRadius: 10,
                zIndex: 1,
              }}
            />
          </View>

          <View
            style={{
              display: "flex",
              marginTop: 20,
              flexDirection: "row",
            }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                flex: 1,
                alignItems: "center",
                marginRight: 20,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontFamily: "InterBold",
                  fontSize: 12,
                  marginBottom: 5,
                }}
              >
                Carbs
              </Text>
              <View
                style={{
                  height: 15,
                  width: "100%",
                }}
              >
                <View
                  style={{
                    height: 14,
                    width: "100%",
                    backgroundColor: "rgba(159, 238, 167, 0.2)",
                    opacity: 50,
                    borderRadius: 10,
                  }}
                />

                <Animated.View
                  style={{
                    // @ts-expect-error
                    ...StyleSheet.absoluteFill,
                    backgroundColor: "#9FEEA7",
                    width: "70%",
                    borderRadius: 10,
                  }}
                />
              </View>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontFamily: "InterBold",
                  fontSize: 11,
                  marginTop: 5,
                }}
              >
                400 / 500 g
              </Text>
            </View>

            <View
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
                marginRight: 20,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontFamily: "InterBold",
                  fontSize: 12,
                  marginBottom: 5,
                }}
              >
                Protein
              </Text>
              <View
                style={{
                  height: 15,
                  width: "100%",
                }}
              >
                <View
                  style={{
                    height: 14,
                    width: "100%",
                    backgroundColor: "rgba(161, 159, 238, 0.2)",
                    opacity: 50,
                    borderRadius: 10,
                  }}
                />

                <Animated.View
                  style={{
                    // @ts-expect-error
                    ...StyleSheet.absoluteFill,
                    backgroundColor: "rgba(161, 159, 238, 1)",
                    width: "45%",
                    borderRadius: 10,
                  }}
                />
              </View>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontFamily: "InterBold",
                  fontSize: 11,
                  marginTop: 5,
                }}
              >
                90 / 200 g
              </Text>
            </View>

            <View
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontFamily: "InterBold",
                  fontSize: 12,
                  marginBottom: 5,
                }}
              >
                Fat
              </Text>
              <View
                style={{
                  height: 15,
                  width: "100%",
                }}
              >
                <View
                  style={{
                    height: 14,
                    width: "100%",
                    backgroundColor: "rgba(238, 225, 159, 0.2)",
                    opacity: 50,
                    borderRadius: 10,
                  }}
                />

                <Animated.View
                  style={{
                    // @ts-expect-error
                    ...StyleSheet.absoluteFill,
                    backgroundColor: "rgba(238, 225, 159, 1)",
                    width: "20%",
                    borderRadius: 10,
                  }}
                />
              </View>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontFamily: "InterBold",
                  fontSize: 11,
                  marginTop: 5,
                }}
              >
                20 / 100 g
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Shadow>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
