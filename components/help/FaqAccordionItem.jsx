import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const FaqAccordionItem = ({ question, answer, isExpanded, onToggle, isLast }) => {
  const { colors } = useTheme();

  const handlePress = useCallback(() => {
    onToggle();
  }, [onToggle]);

  return (
    <View
      style={[
        !isLast && {
          borderBottomWidth: 1,
          borderBottomColor: colors.borderColor,
        },
      ]}
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <ThemedText style={[styles.question, { color: colors.title }]} title>
          {question}
        </ThemedText>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.iconColor}
        />
      </Pressable>

      {isExpanded ? (
        <ThemedText style={[styles.answer, { color: colors.label }]}>
          {answer}
        </ThemedText>
      ) : null}
    </View>
  );
};

export default memo(FaqAccordionItem);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  pressed: {
    opacity: 0.7,
  },
  question: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  answer: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
});
