/**
 * Supabase OAuth for Expo (Google / Apple).
 *
 * Required Supabase dashboard setup:
 * 1. Authentication → Providers: enable Google and Apple.
 * 2. Authentication → URL Configuration: add redirect URLs:
 *    - petsafematch://**
 *    - exp://** (Expo Go dev)
 * 3. Google: authorized redirect URI https://<project-ref>.supabase.co/auth/v1/callback
 * 4. Apple: configure Service ID + redirect URL in Apple Developer portal.
 */
import * as WebBrowser from 'expo-web-browser';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

export const redirectTo = makeRedirectUri({ scheme: 'petsafematch' });

export const createSessionFromUrl = async (url) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    throw new Error(errorCode);
  }

  const { access_token, refresh_token } = params;

  if (!access_token) {
    return null;
  }

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error) {
    throw error;
  }

  return data.session;
};

export const signInWithProvider = async (provider) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw error;
  }

  if (!data?.url) {
    throw new Error('OAuth URL alınamadı.');
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type === 'success' && result.url) {
    return createSessionFromUrl(result.url);
  }

  if (result.type === 'cancel' || result.type === 'dismiss') {
    return null;
  }

  throw new Error('Giriş işlemi tamamlanamadı.');
};
