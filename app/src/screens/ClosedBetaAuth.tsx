import * as yup from "yup";
import { Icon, makeStyles, useTheme } from "@rneui/themed";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, View } from "react-native";
import { AtSymbolIcon } from "react-native-heroicons/outline";
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
      <Heading type="h1">The Yours closed beta</Heading>

      <Image
        source={require("../../assets/images/closed-beta-auth-hero.png")}
        style={styles.heroImage}
      />

      <Heading type="h2" style={styles.h2}>
        You&apos;ll receive an email with a link that will sign you in.
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
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    paddingTop: 60,
    alignItems: "center",
  },

  heroImage: {
    width: "50%",
    height: undefined,
    aspectRatio: 249 / 323,
    marginTop: 50,
    marginBottom: 20,
  },

  h2: {
    marginTop: theme.spacing.xl,
    textAlign: "center",
    maxWidth: 250,
  },

  inputContainer: {
    marginTop: theme.spacing.xl,
    width: "100%",
  },

  button: {
    marginTop: theme.spacing.xl,
    width: "100%",
  },

  buttonIcon: {
    marginRight: theme.spacing.lg,
  },
}));
