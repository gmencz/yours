import { Text, TextProps, useTheme } from "@rneui/themed";

export function Heading1({ style, ...props }: TextProps) {
  return (
    <Text
      style={[style, { fontSize: 16, fontFamily: "InterBold" }]}
      {...props}
    />
  );
}

export function Heading2({ style, ...props }: TextProps) {
  const { theme } = useTheme();

  return <Text style={[style, { color: theme.colors.grey1 }]} {...props} />;
}
