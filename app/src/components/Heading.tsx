import { makeStyles, Text, TextProps } from "@rneui/themed";

type HeadingType = "h1" | "h2";

interface HeadingProps extends TextProps {
  type: HeadingType;
}

export function Heading({ style, type, ...props }: HeadingProps) {
  const styles = useStyles();
  return <Text style={[styles[type], style]} {...props} />;
}

const useStyles = makeStyles((theme) => ({
  h1: {
    fontSize: 16,
    fontFamily: "InterBold",
  },

  h2: {
    fontSize: 14,
    color: theme.colors.grey1,
  },
}));
