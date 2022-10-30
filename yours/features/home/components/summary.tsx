import { LinearGradient } from "expo-linear-gradient";
import { Animated, StyleSheet, Text, View } from "react-native";
import { PencilIcon } from "react-native-heroicons/solid";
import { Shadow } from "react-native-shadow-2";
import Heading from "../../../components/heading";

const gradientColors = {
  red: ["#FF8A8A", "#FF7F7F", "#FF5D5D"],
  green: ["#7AFF7E", "#01BE08", "#008604"],
};

const carbsColor = "#9FEEA7";
const proteinColor = "#A19FEE";
const fatColor = "#EEE19F";

export default function Summary() {
  const stats = {
    calories: {
      goal: 2350,
      consumed: 1598,
    },

    macros: {
      carbs: {
        goal: 287,
        consumed: 184,
      },
      protein: {
        goal: 166,
        consumed: 105,
      },
      fat: {
        goal: 56,
        consumed: 50,
      },
    },
  };

  const carbsCaloriesConsumed = stats.macros.carbs.consumed * 4;
  const carbsCaloriesConsumedPercentage =
    (carbsCaloriesConsumed / stats.calories.goal) * 100;

  const proteinCaloriesConsumed = stats.macros.protein.consumed * 4;
  const proteinCaloriesConsumedPercentage =
    (proteinCaloriesConsumed / stats.calories.goal) * 100;

  const fatCaloriesConsumed = stats.macros.fat.consumed * 9;
  const fatCaloriesConsumedPercentage =
    (fatCaloriesConsumed / stats.calories.goal) * 100;

  const carbsGoalPercentage =
    stats.macros.carbs.goal > stats.macros.carbs.consumed
      ? (stats.macros.carbs.consumed / stats.macros.carbs.goal) * 100
      : 100;

  const proteinGoalPercentage =
    stats.macros.protein.goal > stats.macros.protein.consumed
      ? (stats.macros.protein.consumed / stats.macros.protein.goal) * 100
      : 100;

  const fatGoalPercentage =
    stats.macros.fat.goal > stats.macros.fat.consumed
      ? (stats.macros.fat.consumed / stats.macros.fat.goal) * 100
      : 100;

  return (
    <View>
      <View style={styles.headingContainer}>
        <Heading>Summary</Heading>
        <PencilIcon
          color="#3E75AC"
          fill="#3E75AC"
          size={20}
          style={styles.headingPencilIcon}
        />
      </View>

      <Shadow
        distance={8}
        startColor="rgba(0, 0, 0, 0.2)"
        offset={[3, 4]}
        style={{
          width: "100%",
        }}
      >
        <LinearGradient
          colors={gradientColors.red}
          start={[0.0, 0.0]}
          end={[1.0, 1.0]}
          style={styles.summaryContainer}
        >
          <Text style={styles.caloriesLeftTitle}>CALORIES LEFT</Text>
          <Text style={styles.caloriesLeftNumber}>
            {stats.calories.goal > stats.calories.consumed
              ? stats.calories.goal - stats.calories.consumed
              : 0}
          </Text>

          <View style={styles.caloriesProgressBarContainer}>
            <View style={styles.caloriesProgressBarFillable} />

            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: carbsColor,
                  width: `${carbsCaloriesConsumedPercentage}%`,
                  borderRadius: 10,
                  zIndex: 3,
                },
              ]}
            />

            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  left: `${carbsCaloriesConsumedPercentage - 10}%`,
                  backgroundColor: proteinColor,
                  width: `${proteinCaloriesConsumedPercentage + 10}%`,
                  borderRadius: 10,
                  zIndex: 2,
                },
              ]}
            />

            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  left: `${
                    carbsCaloriesConsumedPercentage -
                    10 +
                    (proteinCaloriesConsumedPercentage + 10) -
                    10
                  }%`,
                  backgroundColor: fatColor,
                  width: `${fatCaloriesConsumedPercentage + 10}%`,
                  borderRadius: 10,
                  zIndex: 1,
                },
              ]}
            />
          </View>

          <View style={styles.macrosContainer}>
            <View style={[styles.macroContainer, { marginRight: 20 }]}>
              <Text style={styles.macroTitle}>Carbs</Text>
              <View style={styles.macroProgressBarContainer}>
                <View
                  style={[
                    styles.macroProgressBarFillable,
                    { backgroundColor: "rgba(159, 238, 167, 0.2)" },
                  ]}
                />

                <Animated.View
                  style={{
                    // @ts-expect-error
                    ...StyleSheet.absoluteFill,
                    backgroundColor: "#9FEEA7",
                    width: `${carbsGoalPercentage}%`,
                    borderRadius: 10,
                  }}
                />
              </View>
              <Text style={styles.macroGramsText}>
                {stats.macros.carbs.consumed} / {stats.macros.carbs.goal} g
              </Text>
            </View>

            <View style={[styles.macroContainer, { marginRight: 20 }]}>
              <Text style={styles.macroTitle}>Protein</Text>
              <View style={styles.macroProgressBarContainer}>
                <View
                  style={[
                    styles.macroProgressBarFillable,
                    { backgroundColor: "rgba(161, 159, 238, 0.2)" },
                  ]}
                />

                <Animated.View
                  style={{
                    // @ts-expect-error
                    ...StyleSheet.absoluteFill,
                    backgroundColor: "rgba(161, 159, 238, 1)",
                    width: `${proteinGoalPercentage}%`,
                    borderRadius: 10,
                  }}
                />
              </View>
              <Text style={styles.macroGramsText}>
                {stats.macros.protein.consumed} / {stats.macros.protein.goal} g
              </Text>
            </View>

            <View style={styles.macroContainer}>
              <Text style={styles.macroTitle}>Fat</Text>
              <View style={styles.macroProgressBarContainer}>
                <View
                  style={[
                    styles.macroProgressBarFillable,
                    { backgroundColor: "rgba(238, 225, 159, 0.2)" },
                  ]}
                />

                <Animated.View
                  style={{
                    // @ts-expect-error
                    ...StyleSheet.absoluteFill,
                    backgroundColor: "rgba(238, 225, 159, 1)",
                    width: `${fatGoalPercentage}%`,
                    borderRadius: 10,
                  }}
                />
              </View>
              <Text style={styles.macroGramsText}>
                {stats.macros.fat.consumed} / {stats.macros.fat.goal} g
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Shadow>
    </View>
  );
}

const styles = StyleSheet.create({
  headingContainer: {
    marginBottom: 10,
    paddingRight: 5,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  headingPencilIcon: {
    marginLeft: "auto",
    marginTop: 3,
  },

  caloriesLeftTitle: {
    color: "#FFFFFF",
    fontFamily: "InterBlack",
    fontSize: 12,
    letterSpacing: 1.5,
  },
  caloriesLeftNumber: {
    color: "#FFFFFF",
    fontFamily: "InterBlack",
    fontSize: 36,
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowRadius: 4,
    textShadowOffset: {
      height: 4,
      width: 0,
    },
  },
  caloriesProgressBarContainer: {
    height: 29,
    width: "100%",
    marginTop: 10,
  },
  caloriesProgressBarFillable: {
    height: 28,
    width: "100%",
    backgroundColor: "#FA7979",
    opacity: 50,
    borderRadius: 10,
  },
  summaryContainer: {
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

  macrosContainer: {
    display: "flex",
    marginTop: 20,
    flexDirection: "row",
  },
  macroContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    flex: 1,
    alignItems: "center",
  },
  macroTitle: {
    color: "#FFFFFF",
    fontFamily: "InterBold",
    fontSize: 12,
    marginBottom: 5,
  },
  macroProgressBarContainer: {
    height: 15,
    width: "100%",
  },
  macroProgressBarFillable: {
    height: 14,
    width: "100%",
    backgroundColor: "rgba(159, 238, 167, 0.2)",
    borderRadius: 10,
  },
  macroGramsText: {
    color: "#FFFFFF",
    fontFamily: "InterBold",
    fontSize: 11,
    marginTop: 5,
  },
});
