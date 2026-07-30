import {
  PRIVACY_DESCRIPTION,
  PRIVACY_POLICY,
} from '../../constants/legalContent';
import LegalDocumentScreen from '../../components/help/LegalDocumentScreen';

export default function PrivacyPolicy() {
  return (
    <LegalDocumentScreen
      title='Gizlilik Politikası'
      description={PRIVACY_DESCRIPTION}
      sections={PRIVACY_POLICY}
    />
  );
}
