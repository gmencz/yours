import { Text, useTheme } from "@rneui/themed";
import { StyleProp, TouchableOpacity, View, ViewStyle } from "react-native";

type RadioButtonProps = {
  value: any;
  label: string;
  labelDescription: string;
  pressed: boolean;
  onPress: (value: any) => void;
  style?: StyleProp<ViewStyle>;
};

export function RadioButton({
  value,
  label,
  labelDescription,
  onPress,
  pressed,
  style,
}: RadioButtonProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          flexDirection: "row",
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={() => {
          onPress(value);
        }}
        style={{
          height: 30,
          width: 30,
          borderRadius: 30,
          backgroundColor: pressed ? theme.colors.primary : theme.colors.grey5,
          borderWidth: 2,
          borderColor: theme.colors.grey4,
          marginTop: 3,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {pressed ? (
          <View
            style={{
              width: 15,
              height: 15,
              backgroundColor: theme.colors.grey5,
              borderRadius: 15,
            }}
          />
        ) : null}
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            marginLeft: theme.spacing.md,
            fontFamily: "InterMedium",
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            marginLeft: theme.spacing.md,
            color: theme.colors.grey1,
            fontSize: 13,
          }}
        >
          {labelDescription}
        </Text>
      </View>
    </View>
  );
}
