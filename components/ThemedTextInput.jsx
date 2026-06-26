import { TextInput } from 'react-native';
import { useTheme } from '../hooks/useTheme';

const ThemedTextInput = ({ style, ...props }) => {
  const { colors } = useTheme();

  return (
    <TextInput
      style={[
        {
          backgroundColor: colors.uiBackground,
          color: colors.text,
          borderRadius: 10,
          padding: 20,
        },
        style,
      ]}
      placeholderTextColor={colors.iconColor}
      {...props}
    />
  );
};

export default ThemedTextInput;
