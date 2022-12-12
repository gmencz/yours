import { Text, useTheme } from "@rneui/themed";
import { useEffect, useState } from "react";
import {
  BarCodeScanner,
  BarCodeScannerResult,
  PermissionStatus,
} from "expo-barcode-scanner";
import { Dimensions, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "modules/supabase/client";
import { FoodCard, FoodCardProps } from "modules/food/components/result-card";
import { Button } from "modules/common/components/button";

export function BarcodeTabScreen() {
  const [hasPermission, setHasPermission] = useState<boolean>();
  const [scannedBarcode, setScannedBarcode] = useState<string>();
  const { theme } = useTheme();

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

  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 30,
        backgroundColor: theme.colors.background,
      }}
    >
      {hasPermission === undefined ? (
        <View style={{ paddingHorizontal: theme.spacing.xl }}>
          <Text>Requesting for camera permission...</Text>
        </View>
      ) : hasPermission === false ? (
        <View style={{ paddingHorizontal: theme.spacing.xl }}>
          <Text>No access to camera</Text>
        </View>
      ) : scannedBarcode ? (
        <BarcodeSearchResults
          barcode={scannedBarcode}
          resetBarcode={() => {
            setScannedBarcode(undefined);
          }}
        />
      ) : (
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          style={{
            flex: 1,
          }}
        />
      )}
    </View>
  );
}

type BarcodeSearchResultsProps = {
  barcode: string;
  resetBarcode: VoidFunction;
};

function BarcodeSearchResults({
  barcode,
  resetBarcode,
}: BarcodeSearchResultsProps) {
  const { theme } = useTheme();
  const {
    isLoading,
    error,
    data: foods,
  } = useQuery({
    queryKey: ["barcodeResults", barcode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("foods")
        .select<string, FoodCardProps["food"]>(
          `
          id,
          name,
          brand,
          photo,
          foods_nutrition_facts (
            values_per,
            calories,
            total_fat,
            carbs,
            protein
          )
        `
        )
        .eq("barcode", barcode)
        .eq("approved", true);

      if (error) {
        throw error;
      }

      return data;
    },
  });

  if (isLoading) {
    return (
      <View style={{ paddingHorizontal: theme.spacing.xl }}>
        <Text>Fetching foods...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ paddingHorizontal: theme.spacing.xl }}>
        <Text
          style={{ color: theme.colors.error, marginBottom: theme.spacing.lg }}
        >
          There was an error fetching foods from the scanned barcode
        </Text>

        <Button
          title="Scan again"
          variant="1"
          onPress={() => {
            resetBarcode();
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ marginTop: theme.spacing.md }}>
      {foods?.length ? (
        <>
          {foods.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </>
      ) : (
        <View>
          <Text style={{ marginBottom: theme.spacing.lg }}>
            We couldn't find any foods using that barcode, you can add one via
            the "Quick Add" tab or scan a different barcode.
          </Text>

          <Button
            title="Scan again"
            variant="1"
            onPress={() => {
              resetBarcode();
            }}
          />
        </View>
      )}
    </View>
  );
}
