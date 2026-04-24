export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  SignUp1: undefined;
  SignUp2: undefined;
  SignUp3: undefined;
  SignUp4: undefined;
  Login: undefined;
  Home: undefined;
  ContactSupport: undefined;
  ForgotPasswordEmail: undefined;
  ForgotPasswordPhone: undefined;
  ForgotPasswordEmailOtp: { email: string };
  ForgotPasswordSmsOtp: { phone: string };
  ForgotPasswordNewPassword: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  import('@react-navigation/native-stack').NativeStackScreenProps<
    RootStackParamList,
    T
  >;
