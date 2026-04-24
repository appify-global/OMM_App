import { Platform } from "react-native";

/**
 * In dev, web only: render the app slightly smaller so you can see the full
 * layout at a glance. Set to `1` to turn off. Does not apply to iOS/Android.
 */
export const WEB_PREVIEW_ZOOM: number = __DEV__ && Platform.OS === "web" ? 0.9 : 1;
