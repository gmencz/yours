import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Text, useThemeMode } from "@rneui/themed";
import { RootStackParamList } from "../types";
import { useTheme } from "@rneui/themed";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { PulseAnimation } from "react-native-animated-pulse";
import { ChevronDownIcon } from "react-native-heroicons/solid";
import { MotiView } from "moti";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

export function WelcomeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { mode } = useThemeMode();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: 70,
      }}
    >
      <View style={{ marginTop: "auto", marginBottom: "auto" }}>
        <Text style={{ fontSize: 24 }}>Meet your new</Text>
        <Text
          style={{
            fontSize: 32,
            fontFamily: "InterBlack",
            marginTop: -10,
          }}
        >
          nutrition coach
        </Text>
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: theme.colors.black,
          width: 70,
          height: 70,
          borderRadius: 70,
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "center",
        }}
      >
        {[...Array(3).keys()].map((index) => (
          <MotiView
            key={index}
            from={{
              opacity: 1,
              scale: 1,
            }}
            animate={{
              opacity: 0,
              scale: 3,
            }}
            transition={{
              type: "timing",
              duration: 2000,
              loop: true,
              repeatReverse: false,
              delay: index * 400,
            }}
            style={[
              StyleSheet.absoluteFillObject,
              {
                width: 70,
                height: 70,
                borderRadius: 70,
                borderWidth: 1,
                borderColor:
                  mode === "light"
                    ? "rgba(0, 0, 0, 0.4)"
                    : "rgba(255, 255, 255, 0.4)",
              },
            ]}
          />
        ))}

        <ChevronDownIcon
          size={25}
          fill={theme.colors.white}
          stroke={theme.colors.white}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
