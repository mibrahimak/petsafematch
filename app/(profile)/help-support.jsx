import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ProfileSection from '../../components/profile/ProfileSection';
import ProfileMenuItem from '../../components/profile/ProfileMenuItem';
import HelpScreenHeader from '../../components/help/HelpScreenHeader';

export default function HelpSupport() {
  const { colors } = useTheme();
  const router = useRouter();

  const handleFaqPress = useCallback(() => {
    router.push('/(profile)/faq');
  }, [router]);

  const handleContactPress = useCallback(() => {
    router.push('/(profile)/contact-support');
  }, [router]);

  const handleRulesPress = useCallback(() => {
    router.push('/(profile)/community-rules');
  }, [router]);

  const handleBugPress = useCallback(() => {
    router.push('/(profile)/report-bug');
  }, [router]);

  return (
    <ThemedView style={styles.container}>
      <HelpScreenHeader title='Yardım & Destek' />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={[styles.description, { color: colors.label }]}>
          Sıkça sorulan sorular, destek talepleri ve topluluk kurallarına buradan
          erişebilirsiniz.
        </ThemedText>

        <View style={styles.sections}>
          <ProfileSection title='Yardım'>
            <ProfileMenuItem
              icon='help-circle-outline'
              label='Sıkça Sorulan Sorular'
              onPress={handleFaqPress}
            />
            <ProfileMenuItem
              icon='mail-outline'
              label='Bize Ulaşın'
              onPress={handleContactPress}
            />
            <ProfileMenuItem
              icon='document-text-outline'
              label='Topluluk Kuralları & Hayvan Refahı'
              onPress={handleRulesPress}
            />
            <ProfileMenuItem
              icon='bug-outline'
              label='Hata Bildir'
              onPress={handleBugPress}
              isLast
            />
          </ProfileSection>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sections: {
    paddingHorizontal: 16,
  },
});
