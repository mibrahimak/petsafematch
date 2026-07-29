import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const NotificationFooterHint = () => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { borderTopColor: colors.borderColor },
      ]}
    >
      <Ionicons name='notifications-outline' size={12} color={colors.label} />
      <ThemedText style={[styles.text, { color: colors.label }]}>
        Bildirim ayarlarını profil sayfasından yönetebilirsiniz.
      </ThemedText>
    </View>
  );
};

export default memo(NotificationFooterHint);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 6,
  },
  text: {
    fontSize: 10,
  },
});
