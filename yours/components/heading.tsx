import { Text, TextProps } from "react-native";

export default function Heading(props: TextProps) {
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: "InterBlack",
          color: "#393939",
          fontSize: 22,
        },
        props.style,
      ]}
    />
  );
}
