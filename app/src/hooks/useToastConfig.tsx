import { useTheme } from "@rneui/themed";
import { BaseToast, ErrorToast, ToastConfig } from "react-native-toast-message";

export function useToastConfig() {
  const { theme } = useTheme();

  const config: ToastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: theme.colors.success,
          backgroundColor: theme.colors.grey5,
        }}
        text2NumberOfLines={2}
        text1Style={{
          color: theme.colors.black,
          fontSize: 14,
        }}
        text2Style={{
          color: theme.colors.grey1,
          fontSize: 14,
        }}
      />
    ),

    error: (props) => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: theme.colors.error,
          backgroundColor: theme.colors.grey5,
        }}
        text2NumberOfLines={2}
        text1Style={{
          color: theme.colors.black,
          fontSize: 14,
        }}
        text2Style={{
          color: theme.colors.grey1,
          fontSize: 14,
        }}
      />
    ),
  };

  return config;
}
