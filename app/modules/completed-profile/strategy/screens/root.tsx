import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTheme } from "@rneui/themed";
import { useProfileQuery } from "modules/auth/hooks/use-profile-query";
import { Heading1, Heading2 } from "modules/common/components/headings";
import { CompletedProfileStackParamList } from "modules/common/types";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = NativeStackScreenProps<CompletedProfileStackParamList, "Strategy">;

export function StrategyScreen({}: Props) {
  const { theme } = useTheme();
  const { data: profile } = useProfileQuery();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.xl,
      }}
    >
      <Heading1>Strategy</Heading1>
    </SafeAreaView>
  );
}
