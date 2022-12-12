import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, useThemeMode } from "@rneui/themed";
import { useTheme } from "@rneui/themed";
import { View } from "react-native";

import { UnauthorizedStackParamList } from "types";
import { AuthButton } from "modules/auth/components/button";
import { Logo } from "modules/common/components/logo";

type Props = NativeStackScreenProps<UnauthorizedStackParamList, "Welcome">;

export function WelcomeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { mode } = useThemeMode();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingHorizontal: theme.spacing.xl,
        paddingTop: 70,
        paddingBottom: 50,
        backgroundColor: theme.colors.background,
      }}
    >
      <Logo />

      <View style={{ marginTop: theme.spacing.xl }}>
        <Text style={{ fontFamily: "InterSemiBold", fontSize: 24 }}>cut</Text>
        <Text style={{ fontFamily: "InterSemiBold", fontSize: 24 }}>bulk</Text>
        <Text style={{ fontFamily: "InterSemiBold", fontSize: 24 }}>
          maintain
        </Text>

        <Text
          style={{
            marginTop: theme.spacing.xl,
            color: theme.colors.grey0,
            fontSize: 16,
          }}
        >
          whatever your goal is, yours will help you reach it by adapting to{" "}
          <Text style={{ fontFamily: "InterBold" }}>YOUR</Text> metabolism and{" "}
          <Text style={{ fontFamily: "InterBold" }}>YOUR</Text> lifestyle.
        </Text>
      </View>

      <View style={{ marginTop: "auto" }}>
        <AuthButton
          provider="Discord"
          navigation={navigation}
          style={{ marginBottom: theme.spacing.lg }}
        />
        <AuthButton
          provider="Google"
          navigation={navigation}
          style={{ marginBottom: theme.spacing.lg }}
        />
        <AuthButton
          provider="Link"
          navigation={navigation}
          style={{ marginBottom: theme.spacing.lg }}
        />
        <AuthButton provider="Email" navigation={navigation} />
      </View>
    </SafeAreaView>
  );
}
