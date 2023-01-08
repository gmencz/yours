import { yupResolver } from "@hookform/resolvers/yup";
import {
  Icon,
  makeStyles,
  Text,
  ThemeMode,
  useTheme,
  useThemeMode,
} from "@rneui/themed";
import { useForm } from "react-hook-form";
import { Dimensions, TouchableOpacity, View } from "react-native";
import { Defs, G, Mask, Path, Svg } from "react-native-svg";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { useSessionListener } from "~/hooks/useSessionListener";
import { useStarterMutation } from "~/hooks/useStarterMutation";

const schema = yup
  .object({
    email: yup
      .string()
      .email("Please enter a valid email")
      .required("Please enter your email"),
  })
  .required();

type Schema = yup.TypeOf<typeof schema>;

export function StarterScreen() {
  useSessionListener();

  const { mode } = useThemeMode();
  const styles = useStyles({ mode });
  const { theme } = useTheme();

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<Schema>({
    resolver: yupResolver(schema),
  });

  const mutation = useStarterMutation();

  const sendLink = (formValues: Schema) => {
    mutation.mutate({ email: formValues.email! });
  };

  return (
    <View style={styles.container}>
      <View style={styles.shapesContainer}>
        <Shapes />
      </View>

      <View style={styles.mainContainer}>
        <Text style={styles.heading}>
          Take control of your nutrition with our smart metabolism tracker.
        </Text>

        <Input
          control={control}
          name="email"
          placeholder="you@example.com"
          icon={
            <Icon
              type="material"
              name="alternate-email"
              size={24}
              color={theme.colors.grey1}
            />
          }
          errorMessage={errors.email?.message}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(sendLink)}
        >
          <Text style={styles.buttonText}>Let&apos;s start</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface UseStylesProps {
  mode: ThemeMode;
}

const useStyles = makeStyles((theme, { mode }: UseStylesProps) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingBottom: 40,
  },

  shapesContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -10,
  },

  mainContainer: {
    marginTop: "auto",
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },

  heading: {
    fontFamily: "SoraBold",
    fontSize: 24,
    marginBottom: theme.spacing.xl,
  },

  button: {
    backgroundColor: theme.colors.primary,
    marginTop: theme.spacing.xl,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 10,
  },

  buttonText: {
    fontFamily: "SoraMedium",
    fontSize: 16,
    color: mode === "dark" ? theme.colors.white : theme.colors.black,
  },
}));

function Shapes() {
  const height = Dimensions.get("screen").height * 0.5;

  return (
    <Svg
      width={Dimensions.get("screen").width + 10}
      height={height}
      preserveAspectRatio="none"
      viewBox="0 0 600 350"
    >
      <G mask='url("#SvgjsMask1028")' fill="none" strokeWidth={2}>
        <Path
          d="M176 83.24c-3.01 0-5.87 1.98-5.87 4.76 0 3.7 2.81 8.19 5.87 8.19 3.2 0 6.64-4.54 6.64-8.19 0-2.83-3.39-4.76-6.64-4.76M440 50.29c-13.09 0-19.41 18.74-19.41 37.71 0 19.89 6.18 40 19.41 40 17.1 0 41.25-20.3 41.25-40 0-19.16-24.01-37.71-41.25-37.71"
          stroke="rgba(124, 121, 135, 1)"
        />
        <Path
          d="M582.35 0c21.11 27.32.31 48.4 13.65 88 3.49 10.35 17.66 1.59 20 11.89 7.66 33.7 0 38.05 0 76.11v88c0 44 22 66 0 88s-44 0-88 0c-26.4 0-52.8 10.6-52.8 0 0-14.67 28.56-23.44 52.8-50.55 15.1-16.89 21.55-16.07 25.88-37.45 8.38-41.34 8.05-46.53-.46-88-4.43-21.6-10.98-38.13-25.42-38.13-16.72 0-25.74 14.93-36.9 38.13-19.18 39.86-6.04 47.25-23.79 88-7.8 17.91-11.16 17.73-27.31 29.33-41.5 29.81-40.59 40.47-88 53.49-40.59 11.14-46.6-7.45-88-5.17-5.64.31-.45 9.69-6.07 10.35-38.38 4.51-40.96 0-81.93 0H88c-44 0-61.6 17.6-88 0-17.6-11.73-11.01-34.99 0-58.67 9.45-20.32 40.93-15.05 40.93-29.33 0-13.92-31.8-7.45-40.93-27.08-11.33-24.37 0-30.46 0-60.92V88C0 44-22 22 0 0s44 0 88 0h440c27.17 0 41.46-16.68 54.35 0"
          stroke="rgba(124, 121, 135, 1)"
        />
        <Path
          d="M0 25.14C3.48 10.17 6.2 4.08 20.47 0 50.2-8.49 54.24 0 88 0h176c24.75 0 25.78-4.74 49.5 0 20.28 4.06 25.48 2.27 38.5 17.6 24.35 28.67 19.69 34.47 36.24 70.4 19.94 43.27 45.55 49.7 36.74 88-9.31 40.49-32.24 41.91-72.98 69.58-24.04 16.33-28.57 8.44-56.57 18.42-16 5.7-20.84.58-31.43 12.94-27.12 31.64-14.78 50.13-44 75.06-14.78 12.6-22 0-44 0H88c-44 0-52.8 8.8-88 0-8.8-2.2-7.46-14.87 0-22 36.54-34.91 39.58-45.49 88-62.09 39.58-13.56 44.24 3.28 88 1.77 12.81-.44 25.14-1.64 25.14-5.68 0-4.3-11.72-10.5-25.14-11-43.15-1.6-47.75 18.23-88 6.81-47.75-13.54-53.04-23.44-88-56.73-9.04-8.61 0-13.54 0-27.08V88c0-31.43-6.75-33.83 0-62.86"
          stroke="rgba(238, 236, 164, 1)"
        />
        <Path
          d="M176 53.51c-21.78 0-42.53 14.38-42.53 34.49 0 26.81 20.38 59.35 42.53 59.35 23.19 0 48.15-32.92 48.15-59.35 0-20.49-24.59-34.49-48.15-34.49"
          stroke="rgba(104, 96, 164, 1)"
        />
        <Path
          d="M602.31 176c2.89-10.16 9.83-16.65 13.69-16.65 2.98 0 0 8.33 0 16.65v88c0 44 22 66 0 88s-44 0-88 0c-1.95 0-3.91.78-3.91 0 0-1.09 2.35-1.53 3.91-3.74 29.52-41.79 38.41-38.28 58.24-84.26 17.32-40.15 4.08-45.84 16.07-88M0 88C13.79 39.1 33.18 38.45 71.63 0 77.18-5.55 79.81 0 88 0h88c24.44 0 48.89-5.63 48.89 0 0 6.26-26.62 8.48-48.89 23.78-41.77 28.7-69.68 25.31-79.2 64.22-9.1 37.2 44.7 50.97 41.97 88-1.67 22.68-24.52 31.43-50.77 31.43-32.14 0-46.36-4.78-66-31.43-24.36-33.07-33.02-48.9-22-88M286 88c5.38-19.48 35.02-7.54 66-7.54 3.96 0 3.04 3.4 3.88 7.54 8.82 43.63 16.93 47.03 15.44 88-.45 12.24-8.96 18.42-19.32 18.42-12.5 0-18.15-5.11-26.4-18.42-24.75-39.9-47.42-59.71-39.6-88M31.43 352c0-9.52 26.05-32.8 56.57-35.2 41.76-3.28 46.78 8.43 88 23.85 5.82 2.18 6.07 7.49 6.07 11.35 0 1.82-3.04 0-6.07 0H88c-28.28 0-56.57 8.08-56.57 0"
          stroke="rgba(124, 121, 135, 1)"
        />
        <Path
          d="M593.29 352c0-26.93 16.89-70.4 22.71-70.4 5.54 0 8.59 43.79 0 70.4-2.77 8.59-22.71 8.27-22.71 0"
          stroke="rgba(238, 236, 164, 1)"
        />
      </G>
      <Defs>
        <Mask id="SvgjsMask1028">
          <Path fill="#fff" d="M0 0H600V350H0z" />
        </Mask>
      </Defs>
    </Svg>
  );
}
