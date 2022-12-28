import * as yup from "yup";
import { Icon, makeStyles, useTheme } from "@rneui/themed";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import { AtSymbolIcon } from "react-native-heroicons/outline";
import { Logo } from "~/components/Logo";
import { Heading } from "~/components/Heading";
import { useSessionListener } from "~/hooks/useSessionListener";
import { Input } from "~/components/Input";
import { Button } from "~/components/Button";
import { useClosedBetaAuthMutation } from "~/hooks/useClosedBetaAuthMutation";

const schema = yup
  .object({
    email: yup
      .string()
      .email("Please enter a valid email")
      .required("Please enter your closed beta email"),
  })
  .required();

type Schema = yup.TypeOf<typeof schema>;

export function ClosedBetaAuthScreen() {
  // Listen for URL changes so if the user signs in via a link which redirects
  // back to the app, we can set their session from the link.
  useSessionListener();

  const styles = useStyles();
  const { theme } = useTheme();

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<Schema>({
    resolver: yupResolver(schema),
  });

  const mutation = useClosedBetaAuthMutation();

  const sendLink = (formValues: Schema) => {
    mutation.mutate({ email: formValues.email! });
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <Logo />

      <Heading type="h2" style={styles.h2}>
        Enter your closed beta email and we'll send you a sign in link.
      </Heading>

      <View style={styles.inputContainer}>
        <Input
          control={control}
          name="email"
          placeholder="you@example.com"
          icon={<AtSymbolIcon size={24} color={theme.colors.black} />}
          errorMessage={errors.email?.message}
        />
      </View>

      <Button
        variant="2"
        title="Send link"
        onPress={handleSubmit(sendLink)}
        style={styles.button}
        icon={
          <Icon
            type="material-community"
            name="link-variant"
            size={25}
            style={styles.buttonIcon}
          />
        }
      />
    </SafeAreaView>
  );
}

const useStyles = makeStyles((theme) => ({
  safeAreaView: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },

  h2: {
    marginTop: theme.spacing.xl,
    textAlign: "center",
  },

  inputContainer: {
    marginTop: theme.spacing.xl,
  },

  button: {
    marginTop: theme.spacing.xl,
  },

  buttonIcon: {
    marginRight: theme.spacing.lg,
  },
}));
