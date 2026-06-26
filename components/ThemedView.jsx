import { View } from 'react-native';
import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ThemedView = ({ style, safe = false, ...props }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (!safe)
    return (
      <View
        style={[{ backgroundColor: colors.background }, style]}
        {...props}
      />
    );

  return (
    <View
      style={[
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
        style,
      ]}
      {...props}
    />
  );
};

export default ThemedView;
