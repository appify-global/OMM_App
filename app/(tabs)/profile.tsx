import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top + 24 }]}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.hint}>Account and settings will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#1c1c1e' },
  hint: { marginTop: 8, fontSize: 15, color: 'rgba(60,60,67,0.55)' },
});
