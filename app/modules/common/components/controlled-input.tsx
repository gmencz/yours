import { Text, useTheme } from "@rneui/themed";
import { useState } from "react";
import { Control, Controller } from "react-hook-form";
import { TextInput, View, TextInputProps } from "react-native";

type ControlledInputProps = {
  control: Control<any>;
  name: string;
  label?: string;
  icon?: JSX.Element;
  errorMessage?: string;
  helperText?: string;
} & TextInputProps;

export function ControlledInput({
  control,
  label,
  name,
  icon,
  helperText,
  errorMessage,
  ...inputProps
}: ControlledInputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View>
      {label ? (
        <Text
          style={{
            marginBottom: 7,
            fontSize: 13,
            fontFamily: "InterMedium",
          }}
        >
          {label}
        </Text>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: isFocused ? theme.colors.grey1 : theme.colors.grey4,
          paddingHorizontal: 15,
          paddingVertical: 15,
          borderRadius: 5,
        }}
      >
        {icon ? icon : null}

        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              {...inputProps}
              onFocus={() => {
                setIsFocused(true);
              }}
              onBlur={() => {
                onBlur();
                setIsFocused(false);
              }}
              onChangeText={onChange}
              value={value}
              placeholderTextColor={theme.colors.grey4}
              style={[
                {
                  color: theme.colors.black,
                  flex: 1,
                  fontFamily: "InterRegular",
                  marginLeft: icon ? theme.spacing.md : undefined,
                },
                inputProps.style,
              ]}
            />
          )}
        />

        {helperText ? (
          <Text
            style={{ color: theme.colors.grey4, marginLeft: theme.spacing.md }}
          >
            {helperText}
          </Text>
        ) : null}
      </View>

      {errorMessage ? (
        <Text
          style={{ marginTop: theme.spacing.md, color: theme.colors.error }}
        >
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}
