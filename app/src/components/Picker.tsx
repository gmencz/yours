import {
  Picker as RNPicker,
  PickerProps as RNPickerProps,
} from "@react-native-picker/picker";
import { Icon, makeStyles, Text, useTheme } from "@rneui/themed";
import { useRef, useState } from "react";
import { Control, Controller } from "react-hook-form";
import { Pressable, View } from "react-native";

interface PickerProps extends RNPickerProps {
  control: Control<any>;
  name: string;
  value?: string;
  label?: string;
  errorMessage?: string;
}

export function Picker({ name, label, control, children, value }: PickerProps) {
  const pickerRef = useRef<RNPicker<string>>(null);
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const styles = useStyles({ isFocused });

  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Pressable
        onPress={() => {
          pickerRef.current?.focus();
        }}
        style={styles.pressable}
      >
        <Text>{value}</Text>
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value } }) => (
            <RNPicker
              ref={pickerRef}
              style={styles.picker}
              itemStyle={styles.pickerItem}
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
            </RNPicker>
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

interface UseStylesProps {
  isFocused: boolean;
}

const useStyles = makeStyles((theme, props: UseStylesProps) => ({
  label: {
    marginBottom: 7,
    fontSize: 13,
    fontFamily: "InterMedium",
  },

  pressable: {
    borderWidth: 1,
    paddingHorizontal: 15,
    borderColor: props.isFocused ? theme.colors.grey1 : theme.colors.grey4,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
  },

  picker: {
    color: theme.colors.background,
    backgroundColor: theme.colors.background,
    flex: 1,
    fontFamily: "InterRegular",
  },

  pickerItem: {
    fontFamily: "InterRegular",
  },
}));
