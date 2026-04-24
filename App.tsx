import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WebPreviewZoom } from './src/components/WebPreviewZoom';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme/theme';

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <WebPreviewZoom>
        <NavigationContainer theme={navTheme}>
          <RootNavigator />
        </NavigationContainer>
      </WebPreviewZoom>
    </SafeAreaProvider>
  );
}
