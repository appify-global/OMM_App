import type { NavigatorScreenParams } from "@react-navigation/native";

export type HomeStackParamList = {
  WorkspaceHome: undefined;
  Notifications: undefined;
};

export type ListingsStackParamList = {
  ListingsList: undefined;
  ListingDetail: { id: string };
  ListingNew: undefined;
};

export type BriefsStackParamList = {
  BriefsList: undefined;
  BriefDetail: { id: string };
  BriefNew: undefined;
};

export type MessagesStackParamList = {
  MessagesList: undefined;
  ThreadDetail: { id: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  ProfileEdit: { title?: string; subtitle?: string };
  Account: { title?: string; subtitle?: string };
  Support: { title?: string; subtitle?: string };
  Feedback: { title?: string; subtitle?: string };
  Reviews: { title?: string; subtitle?: string };
  ReviewsNew: { title?: string; subtitle?: string };
  Disputes: { title?: string; subtitle?: string };
  DisputeDetail: { id: string; title?: string; subtitle?: string };
  DisputeNew: { title?: string; subtitle?: string };
  Billing: { title?: string; subtitle?: string };
  Payouts: { title?: string; subtitle?: string };
  LegalDoc: { doc: string; title?: string; subtitle?: string };
  Danger: { title?: string; subtitle?: string };
  SavedListings: { title?: string; subtitle?: string };
  SavedSearches: { title?: string; subtitle?: string };
  SavedSearchDetail: { id: string; title?: string; subtitle?: string };
  Search: { title?: string; subtitle?: string };
};

export type WorkspaceTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  ListingsTab: NavigatorScreenParams<ListingsStackParamList>;
  BriefsTab: NavigatorScreenParams<BriefsStackParamList>;
  MessagesTab: NavigatorScreenParams<MessagesStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};
