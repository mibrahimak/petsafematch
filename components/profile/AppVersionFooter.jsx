import { memo, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { getAppVersionLabel } from '../../utils/appVersion';
import ThemedText from '../ThemedText';

const AppVersionFooter = () => {
  const { colors } = useTheme();
  const versionLabel = useMemo(() => getAppVersionLabel(), []);

  return (
    <ThemedText style={[styles.text, { color: colors.label }]}>
      {versionLabel}
    </ThemedText>
  );
};

export default memo(AppVersionFooter);

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
});
