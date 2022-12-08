import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Colors, Icon, Text, Theme, useTheme } from "@rneui/themed";
import { TouchableOpacity, View } from "react-native";
import { AuthorizedStackParamList } from "../types";

const icons: Record<
  keyof AuthorizedStackParamList,
  (
    theme: {
      colors: Colors;
    } & Theme,
    isFocused: boolean
  ) => JSX.Element
> = {
  Home: (theme, isFocused) =>
    isFocused ? (
      <Icon type="entypo" name="home" size={30} />
    ) : (
      <Icon type="antdesign" name="home" size={30} color={theme.colors.grey4} />
    ),

  Food: (theme, isFocused) =>
    isFocused ? (
      <Icon type="antdesign" name="apple1" size={30} />
    ) : (
      <Icon
        type="antdesign"
        name="apple-o"
        size={30}
        color={theme.colors.grey4}
      />
    ),
};

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: theme.colors.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        const icon = icons[route.name as keyof AuthorizedStackParamList](
          theme,
          isFocused
        );

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{
              backgroundColor: theme.colors.background,
              paddingVertical: 20,
              paddingHorizontal: theme.spacing.xl,
              alignItems: "center",
            }}
          >
            {icon}

            <Text
              style={{
                fontSize: 12,
                marginTop: 5,
                fontFamily: isFocused ? "InterSemiBold" : "InterMedium",
                color: isFocused ? theme.colors.black : theme.colors.grey4,
              }}
            >
              {label as string}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
