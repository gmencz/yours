import { yupResolver } from "@hookform/resolvers/yup";
import { Picker } from "@react-native-picker/picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, useTheme } from "@rneui/themed";
import {
  Control,
  FieldErrorsImpl,
  useForm,
  UseFormTrigger,
} from "react-hook-form";
import { ScrollView, View } from "react-native";

import { QuickAddStackParamList } from "../../../../types";
import { Button } from "../../../common/components/button";
import { ControlledInput } from "../../../common/components/controlled-input";
import { ControlledPicker } from "../../../common/components/controlled-picker";
import { FormValues } from "./root";

type NutritionFactsDetailsScreenProps = NativeStackScreenProps<
  QuickAddStackParamList,
  "NutritionFacts"
> & {
  valuesPer: string;
  control: Control<FormValues>;
  errors: Partial<FieldErrorsImpl<FormValues>>;
  trigger: UseFormTrigger<FormValues>;
};

export function NutritionFactsDetailsScreen({
  navigation,
  valuesPer,
  control,
  errors,
  trigger,
}: NutritionFactsDetailsScreenProps) {
  const { theme } = useTheme();

  const goNext = async () => {
    const canContinue = await trigger([
      "valuesPer",
      "calories",
      "totalFat",
      "saturatedFat",
      "protein",
      "carbs",
      "sugar",
      "fiber",
      "salt",
    ]);

    if (canContinue) {
      navigation.navigate("Barcode");
    }
  };

  return (
    <ScrollView
      style={{
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.spacing.xl,
      }}
    >
      <Text
        style={{
          fontFamily: "InterBold",
        }}
      >
        Quick Add
      </Text>

      <Text
        style={{
          color: theme.colors.grey1,
          marginTop: theme.spacing.sm,
        }}
      >
        Add a new food to our database, it will be available to everyone once
        approved.
      </Text>

      <View style={{ marginTop: theme.spacing.xl }}>
        <ControlledPicker
          value={valuesPer}
          label="Values per"
          control={control}
          name="valuesPer"
          errorMessage={errors.valuesPer?.message}
        >
          <Picker.Item
            label="100g"
            value="100g"
            style={{ fontFamily: "InterRegular" }}
          />
          <Picker.Item
            label="100ml"
            value="100ml"
            style={{ fontFamily: "InterRegular" }}
          />
        </ControlledPicker>
      </View>

      <View style={{ marginTop: theme.spacing.xl }}>
        <ControlledInput
          label="Calories"
          name="calories"
          control={control}
          placeholder="Enter the calories"
          helperText="kcal"
          errorMessage={errors.calories?.message}
          keyboardType="numeric"
        />
      </View>

      <View style={{ marginTop: theme.spacing.xl }}>
        <ControlledInput
          label="Total fat"
          name="totalFat"
          control={control}
          placeholder="Enter the total fat"
          helperText="g"
          errorMessage={errors.totalFat?.message}
          keyboardType="numeric"
        />
      </View>

      <View style={{ marginTop: theme.spacing.xl }}>
        <ControlledInput
          label="Saturated fat (optional)"
          name="saturatedFat"
          control={control}
          placeholder="Enter the saturated fat"
          helperText="g"
          errorMessage={errors.saturatedFat?.message}
          keyboardType="numeric"
        />
      </View>

      <View style={{ marginTop: theme.spacing.xl }}>
        <ControlledInput
          label="Protein"
          name="protein"
          control={control}
          placeholder="Enter the protein"
          helperText="g"
          errorMessage={errors.protein?.message}
          keyboardType="numeric"
        />
      </View>

      <View style={{ marginTop: theme.spacing.xl }}>
        <ControlledInput
          label="Carbs"
          name="carbs"
          control={control}
          placeholder="Enter the carbs"
          helperText="g"
          errorMessage={errors.carbs?.message}
          keyboardType="numeric"
        />
      </View>

      <View style={{ marginTop: theme.spacing.xl }}>
        <ControlledInput
          label="Sugar (optional)"
          name="sugar"
          control={control}
          placeholder="Enter the sugar"
          helperText="g"
          errorMessage={errors.sugar?.message}
          keyboardType="numeric"
        />
      </View>

      <View style={{ marginTop: theme.spacing.xl }}>
        <ControlledInput
          label="Fiber (optional)"
          name="fiber"
          control={control}
          placeholder="Enter the fiber"
          helperText="g"
          errorMessage={errors.fiber?.message}
          keyboardType="numeric"
        />
      </View>

      <View style={{ marginTop: theme.spacing.xl }}>
        <ControlledInput
          label="Salt (optional)"
          name="salt"
          control={control}
          placeholder="Enter the salt"
          helperText="g"
          errorMessage={errors.salt?.message}
          keyboardType="numeric"
        />
      </View>

      <Button
        title="Next"
        onPress={goNext}
        variant="1"
        style={{
          marginTop: theme.spacing.xl,
          paddingHorizontal: theme.spacing.xl,
          borderRadius: 100,
          alignSelf: "center",
        }}
      />
    </ScrollView>
  );
}
