import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Colors, makeStyles, Theme, useTheme } from "@rneui/themed";
import { TouchableOpacity, View } from "react-native";
import { Path, Svg } from "react-native-svg";
import { CompletedProfileStackParamList } from "~/typings";

interface IconProps {
  active?: boolean;
}

function HomeIcon({ active }: IconProps) {
  const { theme } = useTheme();

  return (
    <Svg
      fill={active ? theme.colors.grey0 : theme.colors.grey4}
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      style={{ height: 27.5, width: 27.5 }}
    >
      {active ? (
        <Path d="M12 1.696L.622 8.807l1.06 1.696L3 9.679V19.5A2.5 2.5 0 005.5 22h13a2.5 2.5 0 002.5-2.5V9.679l1.318.824 1.06-1.696L12 1.696zM12 16.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" />
      ) : (
        <Path d="M12 9a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 11-.001-3.999A2 2 0 0112 15zm0-13.304L.622 8.807l1.06 1.696L3 9.679V19.5A2.5 2.5 0 005.5 22h13a2.5 2.5 0 002.5-2.5V9.679l1.318.824 1.06-1.696L12 1.696zM19 19.5a.5.5 0 01-.5.5h-13a.5.5 0 01-.5-.5V8.429l7-4.375 7 4.375V19.5z" />
      )}
    </Svg>
  );
}

function ProfileIcon({ active }: IconProps) {
  const { theme } = useTheme();

  return (
    <Svg
      fill={active ? theme.colors.grey0 : theme.colors.grey4}
      viewBox="0 0 24 24"
      style={{ height: 27.5, width: 27.5 }}
    >
      {active ? (
        <Path d="M17.863 13.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44zM12 2a4 4 0 100 8 4 4 0 000-8z" />
      ) : (
        <Path d="M5.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C15.318 13.65 13.838 13 12 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46zM12 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM8 6a4 4 0 118 0 4 4 0 01-8 0z" />
      )}
    </Svg>
  );
}

function InsightsIcon({ active }: IconProps) {
  const { theme } = useTheme();

  if (active) {
    return (
      <Svg
        viewBox="0 0 24 24"
        fill={theme.colors.grey0}
        stroke={theme.colors.grey0}
        style={{ height: 27.5, width: 27.5 }}
      >
        <Path
          fillRule="evenodd"
          d="M15.22 6.268a.75.75 0 01.968-.432l5.942 2.28a.75.75 0 01.431.97l-2.28 5.941a.75.75 0 11-1.4-.537l1.63-4.251-1.086.483a11.2 11.2 0 00-5.45 5.174.75.75 0 01-1.199.19L9 12.31l-6.22 6.22a.75.75 0 11-1.06-1.06l6.75-6.75a.75.75 0 011.06 0l3.606 3.605a12.694 12.694 0 015.68-4.973l1.086-.484-4.251-1.631a.75.75 0 01-.432-.97z"
          clipRule="evenodd"
        />
      </Svg>
    );
  }

  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke={theme.colors.grey4}
      style={{ height: 27.5, width: 27.5 }}
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
      />
    </Svg>
  );
}

function StrategyIcon({ active }: IconProps) {
  const { theme } = useTheme();

  if (active) {
    return (
      <Svg
        viewBox="0 0 24 24"
        fill={theme.colors.grey0}
        style={{ height: 27.5, width: 27.5 }}
      >
        <Path d="M11.644 1.59a.75.75 0 01.712 0l9.75 5.25a.75.75 0 010 1.32l-9.75 5.25a.75.75 0 01-.712 0l-9.75-5.25a.75.75 0 010-1.32l9.75-5.25z" />
        <Path d="M3.265 10.602l7.668 4.129a2.25 2.25 0 002.134 0l7.668-4.13 1.37.739a.75.75 0 010 1.32l-9.75 5.25a.75.75 0 01-.71 0l-9.75-5.25a.75.75 0 010-1.32l1.37-.738z" />
        <Path d="M10.933 19.231l-7.668-4.13-1.37.739a.75.75 0 000 1.32l9.75 5.25c.221.12.489.12.71 0l9.75-5.25a.75.75 0 000-1.32l-1.37-.738-7.668 4.13a2.25 2.25 0 01-2.134-.001z" />
      </Svg>
    );
  }

  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke={theme.colors.grey4}
      style={{ height: 27.5, width: 27.5 }}
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3"
      />
    </Svg>
  );
}

const icons: Record<
  keyof CompletedProfileStackParamList,
  (
    theme: {
      colors: Colors;
    } & Theme,
    isFocused: boolean
  ) => JSX.Element
> = {
  Home: (_, isFocused) => (isFocused ? <HomeIcon active /> : <HomeIcon />),

  Strategy: (_, isFocused) =>
    isFocused ? <StrategyIcon active /> : <StrategyIcon />,

  Profile: (_, isFocused) =>
    isFocused ? <ProfileIcon active /> : <ProfileIcon />,

  Insights: (_, isFocused) =>
    isFocused ? <InsightsIcon active /> : <InsightsIcon />,
};

export function BottomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { theme } = useTheme();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
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
            style={styles.tabTouchable}
          >
            {icon}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    backgroundColor: theme.colors.background,
    alignItems: "center",
  },
  tabTouchable: {
    paddingVertical: 20,
    alignItems: "center",
  },
}));
