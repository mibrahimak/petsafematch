import { Stack } from 'expo-router';
import CustomHeader from '../../components/CustomHeader';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='my-pets'
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
