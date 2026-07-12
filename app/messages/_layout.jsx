import { Stack } from 'expo-router';
import CustomHeader from '../../components/CustomHeader';

export default function MessagesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='my-messages'
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='[id]'
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
