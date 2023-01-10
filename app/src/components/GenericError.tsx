import { makeStyles } from "@rneui/themed";
import { Heading } from "./Heading";

export function GenericError() {
  const styles = useStyles();

  return (
    <>
      <Heading type="h1">Unexpected error</Heading>
      <Heading style={styles.errorMessage} type="h2">
        Something went wrong on our side, we are working on it.
      </Heading>
    </>
  );
}

const useStyles = makeStyles((theme) => ({
  errorMessage: {
    color: theme.colors.error,
  },
}));
