import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, useTheme } from "@rneui/themed";
import { Button } from "modules/common/components/button";
import { ControlledInput } from "modules/common/components/controlled-input";
import { QuickAddStackParamList } from "modules/common/types";
import { Control, FieldErrorsImpl, UseFormTrigger } from "react-hook-form";
import { ScrollView, View } from "react-native";

import { FormValues } from "./root";

type RequiredDetailsScreenProps = NativeStackScreenProps<
  QuickAddStackParamList,
  "RequiredDetails"
> & {
  control: Control<FormValues>;
  errors: Partial<FieldErrorsImpl<FormValues>>;
  trigger: UseFormTrigger<FormValues>;
};

export function RequiredDetailsScreen({
  navigation,
  control,
  errors,
  trigger,
}: RequiredDetailsScreenProps) {
  const { theme } = useTheme();

  const goNext = async () => {
    const canContinue = await trigger(["name", "brand"]);
    if (canContinue) {
      navigation.navigate("NutritionFacts");
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
        <ControlledInput
          label="Name"
          name="name"
          control={control}
          placeholder="Enter the name"
          errorMessage={errors.name?.message}
        />
      </View>

      <View style={{ marginTop: theme.spacing.xl }}>
        <ControlledInput
          label="Brand (optional)"
          name="brand"
          control={control}
          placeholder="Enter the brand"
          errorMessage={errors.brand?.message}
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
