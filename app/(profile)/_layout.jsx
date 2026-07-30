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
      <Stack.Screen
        name='edit-profile'
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='email-password'
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='privacy-settings'
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='device-permissions'
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
