import {
  TERMS_DESCRIPTION,
  TERMS_OF_SERVICE,
} from '../../constants/legalContent';
import LegalDocumentScreen from '../../components/help/LegalDocumentScreen';

export default function TermsOfService() {
  return (
    <LegalDocumentScreen
      title='Kullanım Koşulları'
      description={TERMS_DESCRIPTION}
      sections={TERMS_OF_SERVICE}
    />
  );
}
