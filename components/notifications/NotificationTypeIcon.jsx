import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { getNotificationTypeConfig } from '../../constants/notificationOptions';

const NotificationTypeIcon = ({ type, size = 16, compact = false }) => {
  const { colors } = useTheme();
  const config = getNotificationTypeConfig(type);

  const iconColor = useMemo(() => {
    if (config.color) return config.color;
    return colors[config.colorKey] ?? colors.primary;
  }, [config, colors]);

  const containerSize = compact ? 28 : 40;
  const borderRadius = compact ? 8 : 12;

  return (
    <View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius,
          backgroundColor: config.backgroundColor,
        },
      ]}
    >
      <Ionicons
        name={config.icon}
        size={size}
        color={iconColor}
      />
    </View>
  );
};

export default memo(NotificationTypeIcon);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
