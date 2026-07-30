import { memo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

import ThemedView from '../ThemedView';
import ThemedText from '../ThemedText';
import ProfileSection from '../profile/ProfileSection';
import HelpScreenHeader from './HelpScreenHeader';

const LegalDocumentScreen = ({ title, description, sections }) => {
  const { colors } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <HelpScreenHeader title={title} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={[styles.description, { color: colors.label }]}>
          {description}
        </ThemedText>

        <View style={styles.sections}>
          {sections.map((section) => (
            <ProfileSection key={section.id} title={section.title}>
              <View style={styles.sectionContent}>
                <ThemedText style={[styles.sectionText, { color: colors.label }]}>
                  {section.content}
                </ThemedText>
              </View>
            </ProfileSection>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
};

export default memo(LegalDocumentScreen);

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
  sectionContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
