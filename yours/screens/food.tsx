import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthorizedStackParamList } from "../types";
import { Text, useTheme } from "@rneui/themed";

type Props = NativeStackScreenProps<AuthorizedStackParamList, "Food">;

export function FoodScreen({ navigation }: Props) {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: 30,
      }}
    >
      <Text>Food Screen</Text>
    </SafeAreaView>
  );
}
