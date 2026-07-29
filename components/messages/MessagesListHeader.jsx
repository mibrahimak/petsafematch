import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const MessagesListHeader = ({ unreadCount, onBack }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.navBackground,
          borderBottomColor: colors.borderColor,
        },
      ]}
    >
      <View style={styles.leftSection}>
        <Pressable
          style={[
            styles.iconButton,
            {
              backgroundColor: colors.uiBackground,
              borderColor: colors.borderColor,
            },
          ]}
          onPress={onBack}
        >
          <Ionicons name='arrow-back' size={18} color={colors.title} />
        </Pressable>

        <View>
          <ThemedText style={styles.title} title>
            Mesajlar
          </ThemedText>
          {unreadCount > 0 ? (
            <ThemedText style={[styles.subtitle, { color: colors.label }]}>
              {unreadCount} okunmamış
            </ThemedText>
          ) : null}
        </View>
      </View>
    </View>
  );
};

export default memo(MessagesListHeader);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
