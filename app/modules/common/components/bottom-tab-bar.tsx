import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Colors, Icon, Text, Theme, useTheme } from "@rneui/themed";
import { TouchableOpacity, View } from "react-native";
import { CompletedProfileStackParamList } from "modules/common/types";

const icons: Record<
  keyof CompletedProfileStackParamList,
  (
    theme: {
      colors: Colors;
    } & Theme,
    isFocused: boolean
  ) => JSX.Element
> = {
  Home: (theme, isFocused) =>
    isFocused ? (
      <Icon type="material-community" name="home-variant" size={30} />
    ) : (
      <Icon
        type="material-community"
        name="home-variant"
        size={30}
        color={theme.colors.grey4}
      />
    ),

  Strategy: (theme, isFocused) =>
    isFocused ? (
      <Icon type="material-community" name="strategy" size={25} />
    ) : (
      <Icon
        type="material-community"
        name="strategy"
        size={25}
        color={theme.colors.grey4}
      />
    ),

  Insights: (theme, isFocused) =>
    isFocused ? (
      <Icon type="ionicon" name="analytics" size={30} />
    ) : (
      <Icon
        type="ionicon"
        name="analytics-outline"
        size={30}
        color={theme.colors.grey4}
      />
    ),

  Food: (theme, isFocused) =>
    isFocused ? (
      <Icon type="material-community" name="food-apple" size={30} />
    ) : (
      <Icon
        type="material-community"
        name="food-apple-outline"
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
        alignItems: "flex-end",
        borderTopWidth: 1,
        borderTopColor: theme.colors.grey4,
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

        const icon = icons[route.name as keyof CompletedProfileStackParamList](
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
