import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, APP_BUTTON_STACK_GAP } from '@/components/AppButton';

const AUTH_PAD_H = 28;

export default function ContactSupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const canSend = !!fullName.trim() && !!email.trim() && !!message.trim();

  const onSendMessage = () => {
    if (!canSend) return;
    Alert.alert('Message sent', 'We will reply within one business day.');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.navBar, { paddingHorizontal: AUTH_PAD_H }]}>
        <Pressable
          style={styles.navSide}
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <FontAwesome name="chevron-left" size={18} color="#1c1c1e" />
        </Pressable>
        <Text style={styles.navTitle}>Contact support</Text>
        <View style={styles.navSide} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingHorizontal: AUTH_PAD_H, paddingBottom: insets.bottom + 28 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Tell us what went wrong and we will reply within one business day.
        </Text>

        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>FULL NAME</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            autoComplete="name"
            placeholder="Your name"
            placeholderTextColor="rgba(60,60,67,0.45)"
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="you@example.com"
            placeholderTextColor="rgba(60,60,67,0.45)"
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoComplete="tel"
            placeholder="+61 4xx xxx xxx"
            placeholderTextColor="rgba(60,60,67,0.45)"
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>YOUR MESSAGE</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
            placeholder="How can we help?"
            placeholderTextColor="rgba(60,60,67,0.45)"
          />
        </View>

        <AppButton variant="outlined" style={{ marginTop: 8 }} disabled={!canSend} onPress={onSendMessage}>
          Send message
        </AppButton>

        <AppButton
          variant="filled"
          style={{ marginTop: APP_BUTTON_STACK_GAP }}
          onPress={() => router.back()}
          accessibilityLabel="Done">
          Done
        </AppButton>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    marginBottom: 8,
  },
  navSide: { width: 40, alignItems: 'flex-start', justifyContent: 'center' },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  scroll: { paddingTop: 4 },
  intro: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(60,60,67,0.88)',
    lineHeight: 20,
    marginBottom: 22,
  },
  fieldBlock: { marginBottom: 18 },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#636366',
    letterSpacing: 0.1,
    marginBottom: 8,
    marginLeft: 2,
    textTransform: 'uppercase',
  },
  input: {
    minHeight: 54,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(60,60,67,0.55)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(26,26,26,0.96)',
    backgroundColor: 'rgba(255,255,255,0.96)',
  },
  inputMultiline: {
    minHeight: 140,
    paddingTop: 14,
  },
});
