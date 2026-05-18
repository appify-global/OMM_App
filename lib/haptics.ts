import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Primary controls — light impact on press. */
export function hapticLight() {
  if (Platform.OS !== 'ios') return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** Toggles, segments, pickers — subtle “tick”. */
export function hapticSelection() {
  if (Platform.OS !== 'ios') return;
  void Haptics.selectionAsync();
}
