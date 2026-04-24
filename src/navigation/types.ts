export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  SignUp1: undefined;
  SignUp2: undefined;
  SignUp3: undefined;
  SignUp4: undefined;
  Login: undefined;
  /** `mode` optional — e.g. when returning from search to force Selling / Buying. */
  Home: { mode?: 'selling' | 'buying'; focusSearch?: boolean };
  /** Your active listings (selling) or Off-market matches (buying) — title from `context`. */
  ListingSeeAll: { context: 'selling' | 'buying' };
  Messages: undefined;
  Notifications: undefined;
  MessageThread: { name: string; address: string };
  AgentProfile: { agentName?: string };
  AgentReviews: { agentName?: string };
  AgentListings: { agentName?: string };
  BuyerBriefs: undefined;
  /** Buyer: create a brief (form). */
  PostBuyerBrief: undefined;
  BuyerBriefDetail: { id: string };
  /** Off-market / explore results for buying home search. */
  BuyingSearch: { query: string };
  SavedSearches: undefined;
  AuthorityExpiring: undefined;
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
