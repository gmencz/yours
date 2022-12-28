import { makeStyles, Text, useTheme } from "@rneui/themed";
import { useState } from "react";
import { Control, Controller, Noop } from "react-hook-form";
import { TextInput, View, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  control: Control<any>;
  name: string;
  label?: string;
  icon?: JSX.Element;
  errorMessage?: string;
  suffix?: string;
  helperText?: string;
}

export function Input({
  control,
  label,
  name,
  icon,
  suffix,
  helperText,
  errorMessage,
  ...inputProps
}: InputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const styles = useStyles({ hasIcon: !!icon, isFocused });

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (controllerOnBlur: Noop) => {
    controllerOnBlur();
    setIsFocused(false);
  };

  return (
    <>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={styles.container}>
        {icon ? icon : null}

        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              {...inputProps}
              onFocus={handleFocus}
              onBlur={() => handleBlur(onBlur)}
              onChangeText={onChange}
              value={value}
              placeholderTextColor={theme.colors.grey4}
              style={[styles.input, inputProps.style]}
            />
          )}
        />

        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>

      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </>
  );
}

interface UseStylesProps {
  isFocused: boolean;
  hasIcon: boolean;
}

const useStyles = makeStyles((theme, props: UseStylesProps) => ({
  label: {
    marginBottom: 7,
    fontSize: 13,
    fontFamily: "InterMedium",
  },

  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: props.isFocused ? theme.colors.grey1 : theme.colors.grey4,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 5,
  },

  input: {
    color: theme.colors.black,
    flex: 1,
    fontFamily: "InterRegular",
    marginLeft: props.hasIcon ? theme.spacing.md : undefined,
  },

  suffix: {
    color: theme.colors.grey4,
    marginLeft: theme.spacing.md,
  },

  helperText: {
    color: theme.colors.grey2,
    marginTop: theme.spacing.md,
    fontSize: 11,
  },

  error: {
    marginTop: theme.spacing.md,
    color: theme.colors.error,
  },
}));
