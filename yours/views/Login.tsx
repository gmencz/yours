import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View, Text, TextInput, Button } from "react-native";
import { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginView({ navigation }: Props) {
  return (
    <View>
      <Text>Sign Up or Sign In:</Text>
      <View>
        <TextInput placeholder="email" autoCapitalize="none" />
      </View>
      <View>
        <TextInput placeholder="password" secureTextEntry />
      </View>
      <Button title="Sign In" />
      <Button title="Sign Up" />
    </View>
  );
}
