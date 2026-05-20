import { Easing } from 'react-native';
import { FadeIn, FadeInDown } from 'react-native-reanimated';

/** Close to UIKit default easing - smooth, no overshoot (Messages-like). */
export const EASE_APPLE_OUT = Easing.bezier(0.25, 0.1, 0.25, 1);

export const MS_SHELL = 200;
export const MS_ENTER = 240;
export const MS_CROSS = 210;
export const MS_AMBIENT = 300;

/** Stagger delay between `Stagger` children (ms). */
export const STAGGER_MS = 44;

export const enteringShell = () => FadeIn.duration(MS_SHELL).easing(EASE_APPLE_OUT);

export const enteringFadeSlide = (delayMs = 0) =>
  FadeInDown.delay(delayMs).duration(MS_ENTER).easing(EASE_APPLE_OUT);

/** Tab / mode content switch (Selling ↔ Buying). */
export const enteringCrossfade = () => FadeInDown.duration(MS_CROSS).easing(EASE_APPLE_OUT);

export const enteringAmbient = () => FadeIn.duration(MS_AMBIENT).easing(EASE_APPLE_OUT);

/**
 * Native stack defaults - UIKit-standard horizontal slide push, full-screen
 * interactive back gesture, native easing. This is what UINavigationController
 * ships and is what iOS users expect from any first-class app.
 */
export const nativeStackDramatic = {
  animation: 'slide_from_right' as const,
  animationDuration: 320,
  fullScreenGestureEnabled: true,
  gestureEnabled: true,
  animationMatchesGesture: true,
};

/** Bottom-up "presenting modally" transition for surfaces that should feel modal in flow. */
export const nativeStackBottom = {
  animation: 'slide_from_bottom' as const,
  animationDuration: 280,
  fullScreenGestureEnabled: true,
  gestureEnabled: true,
  animationMatchesGesture: true,
};
