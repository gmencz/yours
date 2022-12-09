import { Text, useTheme } from "@rneui/themed";
import { useEffect, useState } from "react";
import {
  BarCodeScanner,
  BarCodeScannerResult,
  PermissionStatus,
} from "expo-barcode-scanner";
import { View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

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
          <BarcodeSearchResults barcode={scannedBarcode} />
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
};

function BarcodeSearchResults({ barcode }: BarcodeSearchResultsProps) {
  const { isLoading, error, data } = useQuery({
    queryKey: ["barcodeResults", barcode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("foods")
        .select("id, name")
        .eq("barcode", barcode)
        .eq("approved", true);

      if (error) {
        throw error;
      }

      return data;
    },
  });

  console.log({ data });

  return null;
}
