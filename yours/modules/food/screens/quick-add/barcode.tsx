import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, useTheme } from "@rneui/themed";
import { useMutation } from "@tanstack/react-query";
import {
  BarCodeScanner,
  BarCodeScannerResult,
  PermissionStatus,
} from "expo-barcode-scanner";
import { useEffect, useState } from "react";
import {
  Control,
  FieldErrorsImpl,
  UseFormHandleSubmit,
  UseFormSetValue,
} from "react-hook-form";
import { Dimensions, ScrollView, View } from "react-native";

import { QuickAddStackParamList } from "../../../../types";
import { Button } from "../../../common/components/button";
import { ControlledInput } from "../../../common/components/controlled-input";
import { supabase } from "../../../supabase/client";
import { FormValues } from "./root";

type BarcodeScreenProps = NativeStackScreenProps<
  QuickAddStackParamList,
  "Barcode"
> & {
  control: Control<FormValues>;
  errors: Partial<FieldErrorsImpl<FormValues>>;
  handleSubmit: UseFormHandleSubmit<FormValues>;
  setValue: UseFormSetValue<FormValues>;
};

const height = Dimensions.get("window").height;

export function BarcodeScreen({
  control,
  errors,
  handleSubmit,
  setValue,
}: BarcodeScreenProps) {
  const { theme } = useTheme();
  const [hasPermission, setHasPermission] = useState<boolean>();
  const [scannedBarcode, setScannedBarcode] = useState<string>();
  const mutation = useMutation<unknown, Error, FormValues>({
    mutationFn: async (values) => {
      const { data: nutritionFacts, error: nutritionFactsError } =
        await supabase
          .from("foods_nutrition_facts")
          .insert({
            values_per: values.valuesPer,
            calories: values.calories,
            total_fat: values.totalFat,
            carbs: values.carbs,
            protein: values.protein,

            saturated_fat: values.saturatedFat || undefined,
            sugar: values.sugar || undefined,
            fiber: values.fiber || undefined,
            salt: values.salt || undefined,
          })
          .select("id")
          .single();

      if (nutritionFactsError) {
        throw nutritionFactsError;
      }

      const { error: foodError } = await supabase.from("foods").insert({
        name: values.name,
        barcode: values.barcode,
        brand: values.brand,
        photo: values.photo,
        nutrition_facts_id: nutritionFacts.id,
      });

      if (foodError) {
        throw foodError;
      }

      return true;
    },
  });

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === PermissionStatus.GRANTED);
    };

    getBarCodeScannerPermissions();
  }, [setHasPermission]);

  const handleBarCodeScanned = ({ data }: BarCodeScannerResult) => {
    setScannedBarcode(data);
  };

  const createFood = (values: FormValues) => mutation.mutate(values);

  useEffect(() => {
    if (scannedBarcode) {
      setValue("barcode", scannedBarcode);
    }
  }, [scannedBarcode]);

  return (
    <ScrollView
      style={{
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.spacing.xl,
        flex: 1,
      }}
    >
      {mutation.isSuccess ? (
        <>
          <Text
            style={{
              fontFamily: "InterBold",
            }}
          >
            Food submitted
          </Text>

          <Text
            style={{
              color: theme.colors.grey1,
              marginTop: theme.spacing.sm,
            }}
          >
            Your food has been submitted for approval and we will review it as
            soon as possible.
          </Text>
        </>
      ) : (
        <>
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
            Add a new food to our database, it will be available to everyone
            once approved.
          </Text>

          <View style={{ marginTop: theme.spacing.xl }}>
            <ControlledInput
              label="Barcode (optional)"
              name="barcode"
              control={control}
              placeholder="Enter or scan a barcode below"
              errorMessage={errors.barcode?.message}
            />
          </View>

          {mutation.isError ? (
            <Text
              style={{ marginTop: theme.spacing.md, color: theme.colors.error }}
            >
              {mutation.error.message}
            </Text>
          ) : null}

          {hasPermission === undefined ? (
            <View>
              <Text
                style={{
                  color: theme.colors.grey1,
                  marginTop: theme.spacing.lg,
                }}
              >
                Requesting for camera permission to display barcode scanner...
              </Text>
            </View>
          ) : hasPermission === false ? (
            <View>
              <Text
                style={{
                  color: theme.colors.grey1,
                  marginTop: theme.spacing.lg,
                }}
              >
                No access to camera, unable to display barcode scanner
              </Text>
            </View>
          ) : (
            <BarCodeScanner
              onBarCodeScanned={handleBarCodeScanned}
              style={{
                width: height - 188,
                height,
                alignSelf: "center",
                marginTop: theme.spacing.xl,
              }}
            />
          )}

          <Button
            title="Submit food for approval"
            onPress={handleSubmit(createFood)}
            variant="1"
            style={{
              marginTop: theme.spacing.xl,
              borderRadius: 100,
              alignSelf: "center",
              paddingHorizontal: theme.spacing.xl,
            }}
          />
        </>
      )}
    </ScrollView>
  );
}
