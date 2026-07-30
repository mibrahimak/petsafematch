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
      <Stack.Screen
        name='help-support'
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='faq'
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='contact-support'
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='community-rules'
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='report-bug'
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
