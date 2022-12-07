import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native";
import { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

export function DashboardScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text>Dashboard</Text>
    </SafeAreaView>
  );
}
