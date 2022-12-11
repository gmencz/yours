import { yupResolver } from "@hookform/resolvers/yup";
import { Text, useTheme } from "@rneui/themed";
import { Control, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import * as yup from "yup";
import { Button } from "./Button";
import { ControlledInput } from "./ControlledInput";
import { Picker } from "@react-native-picker/picker";
import { ControlledPicker } from "./ControlledPicker";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { QuickAddStackParamList } from "../types";

const schema = yup
  .object({
    name: yup.string().required("Name is required"),
    brand: yup.string(),
    valuesPer: yup.string().required("Values per is required"),
    calories: yup.number().required("Calories are required"),
    totalFat: yup.number().required("Total fat is required"),
    saturatedFat: yup.number(),
    protein: yup.number().required("Protein is required"),
    carbs: yup.number().required("Carbs are required"),
    sugar: yup.number(),
    fiber: yup.number(),
    salt: yup.number(),
    photo: yup.string(),
  })
  .required();

type FormValues = yup.TypeOf<typeof schema>;

const QuickAddStack = createNativeStackNavigator<QuickAddStackParamList>();

export function QuickAddTabScreen() {
  const { theme } = useTheme();
  const {
    formState: { errors },
    control,
    watch,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      valuesPer: "100g",
    },
  });

  const valuesPer = watch("valuesPer");

  return (
    <View
      style={{
        paddingVertical: 30,
        backgroundColor: theme.colors.background,
        flex: 1,
      }}
    >
      <QuickAddStack.Navigator
        initialRouteName="RequiredDetails"
        screenOptions={{
          animation: "none",
        }}
      >
        <QuickAddStack.Screen
          name="RequiredDetails"
          options={{
            headerShown: false,
          }}
        >
          {(props) => <RequiredDetailsScreen control={control} {...props} />}
        </QuickAddStack.Screen>

        <QuickAddStack.Screen
          name="NutritionFacts"
          options={{
            headerShown: false,
          }}
        >
          {(props) => (
            <NutritionFactsDetailsScreen
              valuesPer={valuesPer}
              control={control}
              {...props}
            />
          )}
        </QuickAddStack.Screen>

        <QuickAddStack.Screen
          name="AdditionalDetails"
          options={{
            headerShown: false,
          }}
        >
          {(props) => <AdditionalDetailsScreen control={control} {...props} />}
        </QuickAddStack.Screen>
      </QuickAddStack.Navigator>
    </View>
  );
}

type RequiredDetailsScreenProps = {
  control: Control<FormValues>;
} & NativeStackScreenProps<QuickAddStackParamList, "RequiredDetails">;

function RequiredDetailsScreen({
  control,
  navigation,
}: RequiredDetailsScreenProps) {
  const { theme } = useTheme();
  return (
    <ScrollView
      style={{
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.spacing.xl,
      }}
    >
      <Text
        style={{
          fontFamily: "InterBlack",
        }}
      >
        Quick Add
      </Text>

      <Text
        style={{
          color: theme.colors.grey1,
          marginTop: theme.spacing.sm,
        }}
      >
        Add a new food to our database, it will be available to everyone once
        approved.
      </Text>

      <Text
        style={{
          marginTop: theme.spacing.xl,
          fontFamily: "InterBold",
        }}
      >
        What is the food item?
      </Text>

      <View style={{ marginTop: theme.spacing.lg }}>
        <ControlledInput
          label="Name"
          name="name"
          control={control}
          placeholder="Protein powder"
        />
      </View>

      <View style={{ marginTop: theme.spacing.xl }}>
        <ControlledInput
          label="Brand (optional)"
          name="brand"
          control={control}
          placeholder="Prozis"
        />
      </View>

      <Button
        title="Next"
        onPress={() => {
          navigation.navigate("NutritionFacts");
        }}
        variant="1"
        style={{
          marginTop: theme.spacing.xl,
          width: 100,
          borderRadius: 100,
          alignSelf: "center",
        }}
      />
    </ScrollView>
  );
}

// NOTE TO SELF:
// Work on the last screen (additional requirements) and probably move these screens
// into different files so it's cleaner (overall clean stuff).
// Also add the onPress handlers.

type NutritionFactsDetailsScreenProps = {
  control: Control<FormValues>;
  valuesPer?: string;
} & NativeStackScreenProps<QuickAddStackParamList, "NutritionFacts">;

function NutritionFactsDetailsScreen({
  control,
  valuesPer,
  navigation,
}: NutritionFactsDetailsScreenProps) {
  const { theme } = useTheme();

  return (
    <ScrollView
      style={{
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.spacing.xl,
      }}
    >
      <Text
        style={{
          fontFamily: "InterBlack",
        }}
      >
        Quick Add
      </Text>

      <Text
        style={{
          color: theme.colors.grey1,
          marginTop: theme.spacing.sm,
        }}
      >
        Add a new food to our database, it will be available to everyone once
        approved.
      </Text>

      <Text
        style={{
          marginTop: theme.spacing.xl,
          fontFamily: "InterBold",
        }}
      >
        Fill in the nutrition facts
      </Text>

      <View style={{ marginTop: theme.spacing.lg }}>
        <ControlledPicker
          value={valuesPer}
          label="Values per"
          control={control}
          name="valuesPer"
        >
          <Picker.Item
            label="100g"
            value="100g"
            style={{ fontFamily: "InterRegular" }}
          />
          <Picker.Item
            label="100ml"
            value="100ml"
            style={{ fontFamily: "InterRegular" }}
          />
        </ControlledPicker>
      </View>

      <View style={{ marginTop: theme.spacing.xl }}>
        <ControlledInput
          label="Calories"
          name="calories"
          control={control}
          placeholder="Enter the calories"
          helperText="kcal"
        />
      </View>

      <View style={{ marginTop: theme.spacing.xl }}>
        <ControlledInput
          label="Total fat"
          name="totalFat"
          control={control}
          placeholder="Enter the total fat"
          helperText="g"
        />
      </View>

      <View style={{ marginTop: theme.spacing.xl }}>
        <ControlledInput
          label="Saturated fat (optional)"
          name="saturatedFat"
          control={control}
          placeholder="Enter the saturated fat"
          helperText="g"
        />
      </View>

      <View style={{ marginTop: theme.spacing.xl }}>
        <ControlledInput
          label="Protein"
          name="protein"
          control={control}
          placeholder="Enter the protein"
          helperText="g"
        />
      </View>

      <View style={{ marginTop: theme.spacing.xl }}>
        <ControlledInput
          label="Carbs"
          name="carbs"
          control={control}
          placeholder="Enter the carbs"
          helperText="g"
        />
      </View>

      <View style={{ marginTop: theme.spacing.xl }}>
        <ControlledInput
          label="Sugar (optional)"
          name="sugar"
          control={control}
          placeholder="Enter the sugar"
          helperText="g"
        />
      </View>

      <View style={{ marginTop: theme.spacing.xl }}>
        <ControlledInput
          label="Fiber (optional)"
          name="fiber"
          control={control}
          placeholder="Enter the fiber"
          helperText="g"
        />
      </View>

      <View style={{ marginTop: theme.spacing.xl }}>
        <ControlledInput
          label="Salt (optional)"
          name="salt"
          control={control}
          placeholder="Enter the salt"
          helperText="g"
        />
      </View>

      <Button
        title="Next"
        onPress={() => {
          navigation.navigate("AdditionalDetails");
        }}
        variant="1"
        style={{
          marginTop: theme.spacing.xl,
          width: 100,
          borderRadius: 100,
          alignSelf: "center",
        }}
      />
    </ScrollView>
  );
}

type AdditionalDetailsScreenProps = {
  control: Control<FormValues>;
} & NativeStackScreenProps<QuickAddStackParamList, "AdditionalDetails">;

function AdditionalDetailsScreen({
  control,
  navigation,
}: AdditionalDetailsScreenProps) {
  const { theme } = useTheme();
  return (
    <ScrollView
      style={{
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.spacing.xl,
      }}
    >
      <Text
        style={{
          fontFamily: "InterBold",
        }}
      >
        Quick Add
      </Text>

      <Text
        style={{
          color: theme.colors.grey1,
          marginTop: theme.spacing.sm,
        }}
      >
        Add a new food to our database, it will be available to everyone once
        approved.
      </Text>

      <Text
        style={{
          marginTop: theme.spacing.xl,
          fontFamily: "InterBold",
        }}
      >
        Some extra details
      </Text>

      <View style={{ marginTop: theme.spacing.lg }}>
        <ControlledInput
          label="Photo (optional)"
          name="photo"
          control={control}
          placeholder="Photo"
        />
      </View>

      <Button
        title="Next"
        onPress={() => {
          navigation.navigate("NutritionFacts");
        }}
        variant="1"
        style={{
          marginTop: theme.spacing.xl,
          width: 100,
          borderRadius: 100,
          alignSelf: "center",
        }}
      />
    </ScrollView>
  );
}
