import { memo } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

const MessagesSearchBar = ({ value, onChangeText }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.uiBackground,
            borderColor: colors.borderColor,
          },
        ]}
      >
        <Ionicons name='search' size={15} color={colors.label} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder='Konuşma ara...'
          placeholderTextColor={colors.label}
          style={[styles.input, { color: colors.title }]}
        />
        {value ? (
          <Pressable onPress={() => onChangeText('')} hitSlop={8}>
            <Ionicons name='close' size={14} color={colors.label} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

export default memo(MessagesSearchBar);

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
});
