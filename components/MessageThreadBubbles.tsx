import { Text } from '@/components/OMMText';
import { slateNavy } from '@/constants/theme';
import { formatMessageClock, type StoredMessage } from '@/lib/omm-messages';
import { StyleSheet, View } from 'react-native';

export function MessageThreadBubbles({ messages }: { messages: StoredMessage[] }) {
  if (messages.length === 0) {
    return (
      <Text style={styles.empty}>No messages in this thread yet.</Text>
    );
  }

  return (
    <View style={styles.wrap}>
      {messages.map((m) => {
        const outbound = m.direction === 'outbound';
        return (
          <View
            key={m.id}
            style={[styles.row, outbound ? styles.rowOut : styles.rowIn]}>
            <View style={[styles.bubble, outbound ? styles.bubbleOut : styles.bubbleIn]}>
              <Text style={[styles.bubbleText, outbound && styles.bubbleTextOut]}>
                {m.body}
              </Text>
            </View>
            <Text style={[styles.time, outbound && styles.timeOut]}>
              {formatMessageClock(m.sentAtIso)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14, marginBottom: 16 },
  empty: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.45)',
    marginBottom: 16,
  },
  row: { alignSelf: 'stretch' },
  rowIn: { alignItems: 'flex-start' },
  rowOut: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '92%',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  bubbleIn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.12)',
  },
  bubbleOut: {
    backgroundColor: slateNavy,
  },
  bubbleText: { fontSize: 15, lineHeight: 22, color: '#000000' },
  bubbleTextOut: { color: '#ffffff' },
  time: { marginTop: 4, fontSize: 12, color: 'rgba(0, 0, 0, 0.45)' },
  timeOut: { textAlign: 'right' },
});
