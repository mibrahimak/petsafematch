import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const HelpScreenHeader = ({ title }) => {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View style={styles.header}>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        hitSlop={8}
      >
        <Ionicons name='arrow-back' size={24} color={colors.text} />
      </Pressable>
      <ThemedText style={styles.headerTitle} title>
        {title}
      </ThemedText>
    </View>
  );
};

export default memo(HelpScreenHeader);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: 8,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.8,
  },
});
