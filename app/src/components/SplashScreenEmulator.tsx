import { Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function SplashScreenEmulator() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }}>
      <Image
        source={require("../../assets/images/splash.png")}
        style={{ height: "100%", width: "100%" }}
      />
    </SafeAreaView>
  );
}
