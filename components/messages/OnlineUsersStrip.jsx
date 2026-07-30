import { memo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';
import { isUserOnline } from '../../utils/presenceUtils';
import { getVisibleLastSeen } from '../../utils/privacyUtils';

const OnlineUsersStrip = ({ conversations, onPressConversation }) => {
  const { colors } = useTheme();

  const onlineConversations = conversations.filter((item) =>
    isUserOnline(getVisibleLastSeen(item.profile))
  );

  if (onlineConversations.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <ThemedText style={[styles.label, { color: colors.label }]}>
        ÇEVRİMİÇİ
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {onlineConversations.map((item) => {
          const fullName = item.profile?.full_name || 'Kullanıcı';
          const avatarUrl =
            item.profile?.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=5046e5&color=fff&size=150`;

          return (
            <Pressable
              key={item.otherUserId}
              style={styles.userItem}
              onPress={() => onPressConversation(item.otherUserId)}
            >
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                <View
                  style={[
                    styles.onlineDot,
                    { borderColor: colors.background },
                  ]}
                />
              </View>
              <ThemedText
                style={[styles.userName, { color: colors.text }]}
                numberOfLines={1}
              >
                {fullName.split(' ')[0]}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default memo(OnlineUsersStrip);

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 4,
  },
  userItem: {
    alignItems: 'center',
    width: 56,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
  },
  userName: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
});
