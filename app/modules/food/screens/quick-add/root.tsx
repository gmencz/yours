import { yupResolver } from "@hookform/resolvers/yup";
import { useTheme } from "@rneui/themed";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import * as yup from "yup";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { QuickAddStackParamList } from "../../../../types";
import { RequiredDetailsScreen } from "./required-details";
import { NutritionFactsDetailsScreen } from "./nutrition-facts";
import { BarcodeScreen } from "./barcode";

const schema = yup
  .object({
    name: yup.string().required("Name is required"),
    brand: yup.string(),
    valuesPer: yup.string().required("Values per is required"),
    calories: yup
      .number()
      .typeError("Calories are required")
      .required("Calories are required"),
    totalFat: yup
      .number()
      .typeError("Total fat is required")
      .required("Total fat is required"),
    saturatedFat: yup.number(),
    protein: yup
      .number()
      .typeError("Protein is required")
      .required("Protein is required"),
    carbs: yup.number().typeError("v").required("Carbs are required"),
    sugar: yup.number(),
    fiber: yup.number(),
    salt: yup.number(),
    barcode: yup.string(),
  })
  .required();

export type FormValues = yup.TypeOf<typeof schema>;

const QuickAddStack = createNativeStackNavigator<QuickAddStackParamList>();

export function QuickAddRootScreen() {
  const { theme } = useTheme();
  const {
    formState: { errors },
    control,
    watch,
    trigger,
    handleSubmit,
    setValue,
  } = useForm<FormValues>({
    mode: "all",
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
          {(props) => (
            <RequiredDetailsScreen
              trigger={trigger}
              errors={errors}
              control={control}
              {...props}
            />
          )}
        </QuickAddStack.Screen>

        <QuickAddStack.Screen
          name="NutritionFacts"
          options={{
            headerShown: false,
          }}
        >
          {(props) => (
            <NutritionFactsDetailsScreen
              trigger={trigger}
              valuesPer={valuesPer!}
              errors={errors}
              control={control}
              {...props}
            />
          )}
        </QuickAddStack.Screen>

        <QuickAddStack.Screen
          name="Barcode"
          options={{
            headerShown: false,
          }}
        >
          {(props) => (
            <BarcodeScreen
              handleSubmit={handleSubmit}
              errors={errors}
              control={control}
              setValue={setValue}
              {...props}
            />
          )}
        </QuickAddStack.Screen>
      </QuickAddStack.Navigator>
    </View>
  );
}
