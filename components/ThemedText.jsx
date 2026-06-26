import { Text } from 'react-native';
import { useTheme } from '../hooks/useTheme';

const ThemedText = ({ style, title = false, ...props }) => {
  const { colors } = useTheme();

  const textColor = title ? colors.title : colors.text;

  return <Text style={[{ color: textColor }, style]} {...props} />;
};

export default ThemedText;
