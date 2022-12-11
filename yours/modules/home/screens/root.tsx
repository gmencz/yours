import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, useTheme } from "@rneui/themed";

import { AuthorizedStackParamList } from "../../../types";

type Props = NativeStackScreenProps<AuthorizedStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
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
      <Text>Home Screen</Text>
    </SafeAreaView>
  );
}
