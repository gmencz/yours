import { Icon, Image, Text, useTheme } from "@rneui/themed";
import { formatDecimal } from "modules/common/utils/formatDecimal";
import { View } from "react-native";

export type FoodCardProps = {
  food: {
    id: string;
    name: string;
    brand?: string;
    foods_nutrition_facts: {
      values_per: string;
      calories: number;
      total_fat: number;
      carbs: number;
      protein: number;
    };
  };
};

export function FoodCard({ food }: FoodCardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
      }}
    >
      <View
        style={{
          flexDirection: "column",
          flex: 1,
        }}
      >
        <Text style={{ fontFamily: "InterBold" }}>
          {food.brand ? `${food.name} by ${food.brand}` : food.name}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: theme.colors.grey1,
              fontSize: 12,
            }}
          >
            {formatDecimal(food.foods_nutrition_facts.calories)}
          </Text>
          <Icon
            type="material-community"
            name="fire"
            size={14}
            color={theme.colors.grey1}
          />

          <Text
            style={{
              color: theme.colors.grey1,
              fontSize: 12,
              marginLeft: theme.spacing.md,
            }}
          >
            {formatDecimal(food.foods_nutrition_facts.protein)}P
          </Text>

          <Text
            style={{
              color: theme.colors.grey1,
              fontSize: 12,
              marginLeft: theme.spacing.md,
            }}
          >
            {formatDecimal(food.foods_nutrition_facts.total_fat)}F
          </Text>

          <Text
            style={{
              color: theme.colors.grey1,
              fontSize: 12,
              marginLeft: theme.spacing.md,
            }}
          >
            {formatDecimal(food.foods_nutrition_facts.carbs)}C
          </Text>

          <Icon
            type="entypo"
            name="dot-single"
            size={14}
            color={theme.colors.grey1}
            style={{
              marginHorizontal: theme.spacing.sm,
            }}
          />

          <Text
            style={{
              color: theme.colors.grey1,
              fontSize: 12,
            }}
          >
            per {food.foods_nutrition_facts.values_per}
          </Text>
        </View>
      </View>
    </View>
  );
}
