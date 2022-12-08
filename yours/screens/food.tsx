import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthorizedStackParamList } from "../types";
import { Icon, Text, useTheme } from "@rneui/themed";
import { Button } from "../components/Button";

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
      <Text
        style={{
          fontFamily: "InterBold",
          fontSize: 20,
        }}
      >
        Food
      </Text>

      <Text
        style={{
          marginTop: theme.spacing.lg,
        }}
      >
        We are currently building a huge database of food, drinks, supplements
        and pretty much anything you would want to track.
      </Text>

      <Text
        style={{
          marginTop: theme.spacing.lg,
        }}
      >
        You can contribute to our database with foods you think you'd like to
        track with Yours in the future.
      </Text>

      <Button
        variant="2"
        title="Submit food"
        icon={
          <Icon
            name="add"
            type="material"
            size={30}
            style={{ marginRight: 45 }}
          />
        }
        onPress={() => {}}
        style={{ marginTop: theme.spacing.xl }}
      />
    </SafeAreaView>
  );
}
