import { Icon, Image, Text, useTheme, useThemeMode } from "@rneui/themed";
import { useEffect, useState } from "react";
import {
  BarCodeScanner,
  BarCodeScannerResult,
  PermissionStatus,
} from "expo-barcode-scanner";
import { View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { Button } from "./Button";

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
        marginTop: theme.spacing.xl,
        paddingHorizontal: theme.spacing.xl,
        flex: 1,
      }}
    >
      {hasPermission === undefined ? (
        <Text>Requesting for camera permission...</Text>
      ) : hasPermission === false ? (
        <Text>No access to camera</Text>
      ) : scannedBarcode ? (
        <View>
          <BarcodeSearchResults
            barcode={scannedBarcode}
            resetBarcode={() => {
              setScannedBarcode(undefined);
            }}
          />
        </View>
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
        .select<
          string,
          {
            id: string;
            name: string;
            brand?: string;
            photo?: string;
            foods_nutrition_facts: {
              values_per: string;
              calories: string;
              total_fat: string;
              carbs: string;
              protein: string;
            };
          }
        >(
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
    return <Text>Fetching foods...</Text>;
  }

  if (error) {
    return (
      <View>
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
    <View>
      {foods?.length ? (
        foods.map((food) => (
          <View
            key={food.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: theme.spacing.md,
            }}
          >
            {food.photo ? (
              <Image
                source={{ uri: food.photo }}
                style={{
                  height: 60,
                  width: 60,
                  marginRight: theme.spacing.lg,
                  borderRadius: 10,
                }}
              />
            ) : null}

            <View style={{ flexDirection: "column" }}>
              <Text style={{ fontFamily: "InterBold" }}>{food.name}</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: theme.colors.grey1,
                    marginRight: 2,
                    fontSize: 12,
                  }}
                >
                  {food.foods_nutrition_facts.calories}
                </Text>
                <Icon
                  type="material-community"
                  name="fire"
                  size={15}
                  color={theme.colors.grey1}
                />

                <Text
                  style={{
                    color: theme.colors.grey1,
                    marginLeft: 5,
                    fontSize: 12,
                  }}
                >
                  {food.foods_nutrition_facts.protein} P
                </Text>

                <Text
                  style={{
                    color: theme.colors.grey1,
                    marginLeft: 10,
                    fontSize: 12,
                  }}
                >
                  {food.foods_nutrition_facts.total_fat} F
                </Text>

                <Text
                  style={{
                    color: theme.colors.grey1,
                    marginLeft: 10,
                    fontSize: 12,
                  }}
                >
                  {food.foods_nutrition_facts.carbs} C
                </Text>

                <Text
                  style={{
                    color: theme.colors.grey1,
                    marginLeft: 5,
                    fontSize: 12,
                  }}
                >
                  • {food.foods_nutrition_facts.values_per}
                </Text>
              </View>
            </View>
          </View>
        ))
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
