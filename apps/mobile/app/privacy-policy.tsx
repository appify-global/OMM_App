import { LegalDocumentScreen } from '@/components/LegalDocumentScreen';
import { LEGAL_PRIVACY_BODY } from '@/lib/legal-docs';

export default function PrivacyPolicyScreen() {
  return <LegalDocumentScreen title="Privacy Policy" body={LEGAL_PRIVACY_BODY} />;
}
