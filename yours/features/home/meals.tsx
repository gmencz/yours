import { Image, StyleSheet, Text, View } from "react-native";
import { Shadow } from "react-native-shadow-2";
import Heading from "../../components/heading";

const mealShadowStartColor = "rgba(0, 0, 0, 0.075)";

export default function Meals() {
  const meals = {
    breakfast: {
      calories: 400,
    },
    lunch: {
      calories: 408,
    },
    dinner: {
      calories: 400,
    },
    snacks: {
      calories: 400,
    },
  };

  return (
    <View style={{ marginTop: 30 }}>
      <Heading style={{ marginBottom: 10 }}>Meals</Heading>

      <Shadow
        distance={3}
        startColor={mealShadowStartColor}
        offset={[3, 4]}
        style={[styles.mealContainer, { marginBottom: 15 }]}
      >
        <View style={styles.mealInnerContainer}>
          <Image
            style={styles.mealImage}
            source={require("../../assets/images/meals/breakfast.png")}
          />
          <Text style={styles.mealName}>Breakfast</Text>
          <Text style={styles.mealCalories}>
            {meals.breakfast.calories} cal
          </Text>
        </View>
      </Shadow>

      <Shadow
        distance={3}
        startColor={mealShadowStartColor}
        offset={[3, 4]}
        style={[styles.mealContainer, { marginBottom: 15 }]}
      >
        <View style={styles.mealInnerContainer}>
          <Image
            style={styles.mealImage}
            source={require("../../assets/images/meals/lunch.png")}
          />
          <Text style={styles.mealName}>Lunch</Text>
          <Text style={styles.mealCalories}>{meals.lunch.calories} cal</Text>
        </View>
      </Shadow>

      <Shadow
        distance={3}
        startColor={mealShadowStartColor}
        offset={[3, 4]}
        style={[styles.mealContainer, { marginBottom: 15 }]}
      >
        <View style={styles.mealInnerContainer}>
          <Image
            style={styles.mealImage}
            source={require("../../assets/images/meals/dinner.png")}
          />
          <Text style={styles.mealName}>Dinner</Text>
          <Text style={styles.mealCalories}>{meals.dinner.calories} cal</Text>
        </View>
      </Shadow>

      <Shadow
        distance={3}
        startColor={mealShadowStartColor}
        offset={[3, 4]}
        style={styles.mealContainer}
      >
        <View style={styles.mealInnerContainer}>
          <Image
            style={styles.mealImage}
            source={require("../../assets/images/meals/snacks.png")}
          />
          <Text style={styles.mealName}>Snacks</Text>
          <Text style={styles.mealCalories}>{meals.snacks.calories} cal</Text>
        </View>
      </Shadow>
    </View>
  );
}

const styles = StyleSheet.create({
  mealContainer: {
    width: "100%",
    borderRadius: 10,
  },
  mealInnerContainer: {
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  mealImage: {
    width: 40,
    height: 40,
  },
  mealName: {
    fontFamily: "InterBold",
    fontSize: 16,
    color: "#606060",
    marginLeft: 10,
  },
  mealCalories: {
    fontFamily: "InterBold",
    fontSize: 16,
    marginLeft: "auto",
    color: "#606060",
  },
});
