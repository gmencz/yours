export type UnauthorizedStackParamList = {
  Welcome: undefined;
  CreateAccount: undefined;
  LinkSignIn: undefined;
  EmailSignIn: undefined;
};

export type AuthorizedStackParamList = {
  Home: undefined;
  Food: {
    screen: keyof FoodTabStackParamList;
  };
};

export type QuickAddStackParamList = {
  RequiredDetails: undefined;
  NutritionFacts: undefined;
  AdditionalDetails: undefined;
};

export type FoodTabStackParamList = {
  Barcode: undefined;
  Search: undefined;
  QuickAdd: undefined;
};
