import { yupResolver } from "@hookform/resolvers/yup";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, useTheme } from "@rneui/themed";
import {
  Control,
  FieldErrorsImpl,
  useForm,
  UseFormHandleSubmit,
  UseFormTrigger,
} from "react-hook-form";
import { ScrollView, View } from "react-native";

import { QuickAddStackParamList } from "types";
import { Button } from "modules/common/components/button";
import { ControlledInput } from "modules/common/components/controlled-input";
import { supabase } from "modules/supabase/client";
import { FormValues } from "./root";

type AdditionalDetailsScreenProps = NativeStackScreenProps<
  QuickAddStackParamList,
  "AdditionalDetails"
> & {
  control: Control<FormValues>;
  errors: Partial<FieldErrorsImpl<FormValues>>;
  handleSubmit: UseFormHandleSubmit<FormValues>;
  trigger: UseFormTrigger<FormValues>;
};

export function AdditionalDetailsScreen({
  navigation,
  control,
  errors,
  handleSubmit,
  trigger,
}: AdditionalDetailsScreenProps) {
  const { theme } = useTheme();

  const goNext = async () => {
    const canContinue = await trigger(["photo"]);

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
        <ControlledInput
          label="Photo URL (optional)"
          name="photo"
          control={control}
          placeholder="Enter the photo URL"
          errorMessage={errors.photo?.message}
          keyboardType="url"
        />
      </View>

      <Button
        title="Next"
        onPress={goNext}
        variant="1"
        style={{
          marginTop: theme.spacing.xl,
          borderRadius: 100,
          alignSelf: "center",
          paddingHorizontal: theme.spacing.xl,
        }}
      />
    </ScrollView>
  );
}
