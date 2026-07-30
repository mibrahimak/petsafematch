import Constants from 'expo-constants';

export const getAppVersionLabel = () => {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const build =
    Constants.nativeBuildVersion ??
    Constants.expoConfig?.ios?.buildNumber ??
    Constants.expoConfig?.android?.versionCode ??
    '1';

  return `v${version}`;
};
