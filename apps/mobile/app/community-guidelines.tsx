import { LegalDocumentScreen } from '@/components/LegalDocumentScreen';
import { LEGAL_GUIDELINES_BODY } from '@/lib/legal-docs';

export default function CommunityGuidelinesScreen() {
  return <LegalDocumentScreen title="Community Guidelines" body={LEGAL_GUIDELINES_BODY} />;
}
