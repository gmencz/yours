import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../types";
import { Text, useTheme } from "@rneui/themed";

type Props = NativeStackScreenProps<RootStackParamList, "EmailSignIn">;

export function EmailSignInScreen({ navigation }: Props) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Text>Email Sign In</Text>
    </SafeAreaView>
  );
}
