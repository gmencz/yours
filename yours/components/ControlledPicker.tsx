import { Picker, PickerProps } from "@react-native-picker/picker";
import { Icon, Text, useTheme } from "@rneui/themed";
import { useRef, useState } from "react";
import { Control, Controller } from "react-hook-form";
import { Pressable, View } from "react-native";

type SelectProps = {
  control: Control<any>;
  name: string;
  value?: string;
  label?: string;
  errorMessage?: string;
} & PickerProps;

export function ControlledPicker({
  name,
  label,
  control,
  children,
  value,
}: SelectProps) {
  const pickerRef = useRef<Picker<string>>(null);
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

      <Pressable
        onPress={() => {
          pickerRef.current?.focus();
        }}
        style={{
          borderWidth: 1,
          paddingHorizontal: 15,
          borderColor: isFocused ? theme.colors.grey1 : theme.colors.grey4,
          borderRadius: 5,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text style={{}}>{value}</Text>
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value } }) => (
            <Picker
              ref={pickerRef}
              style={{
                color: theme.colors.background,
                backgroundColor: theme.colors.background,
                flex: 1,
                fontFamily: "InterRegular",
              }}
              itemStyle={{ fontFamily: "InterRegular" }}
              dropdownIconColor={theme.colors.background}
              selectedValue={value}
              onBlur={() => {
                onBlur();
                setIsFocused(false);
              }}
              onValueChange={onChange}
              onFocus={() => {
                setIsFocused(true);
              }}
            >
              {children}
            </Picker>
          )}
        />

        <Icon
          size={24}
          name="chevron-down"
          type="entypo"
          color={theme.colors.grey1}
        />
      </Pressable>
    </View>
  );
}
