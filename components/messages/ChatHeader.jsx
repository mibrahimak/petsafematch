import { memo } from 'react';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';
import { formatLastSeen, isUserOnline } from '../../utils/presenceUtils';

const ChatHeader = ({
  fullName,
  avatarUrl,
  lastSeenAt,
  onBack,
  onMenuPress,
}) => {
  const { colors } = useTheme();
  const online = isUserOnline(lastSeenAt);

  const handleMenuPress = () => {
    if (onMenuPress) {
      onMenuPress();
      return;
    }
    Alert.alert('Yakında', 'Bu özellik yakında eklenecek.');
  };

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.borderColor,
        },
      ]}
    >
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

      <View style={styles.avatarWrapper}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        {online ? (
          <View
            style={[styles.onlineDot, { borderColor: colors.navBackground }]}
          />
        ) : null}
      </View>

      <View style={styles.textWrapper}>
        <ThemedText
          style={[styles.name, { color: colors.title }]}
          numberOfLines={1}
        >
          {fullName}
        </ThemedText>
        <ThemedText
          style={[styles.status, { color: online ? '#10b981' : colors.label }]}
          numberOfLines={1}
        >
          {online ? 'Çevrimiçi' : formatLastSeen(lastSeenAt)}
        </ThemedText>
      </View>

      <Pressable
        style={[
          styles.iconButton,
          {
            backgroundColor: colors.uiBackground,
            borderColor: colors.borderColor,
          },
        ]}
        onPress={handleMenuPress}
      >
        <Ionicons name='ellipsis-vertical' size={16} color={colors.label} />
      </Pressable>
    </View>
  );
};

export default memo(ChatHeader);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarWrapper: {
    position: 'relative',
    flexShrink: 0,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
    borderWidth: 2,
  },
  textWrapper: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  status: {
    fontSize: 11,
    marginTop: 2,
  },
});
