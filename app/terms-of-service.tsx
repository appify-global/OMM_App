import { LegalDocumentScreen } from '@/components/LegalDocumentScreen';
import { LEGAL_TERMS_BODY } from '@/lib/legal-docs';

/**
 * Terms of Service — solid-bordered document shell (read-only).
 * [Figma 1053:3217](https://www.figma.com/design/H5hNLHSDJ0mmP61piGW2T4/OMM?node-id=1053-3217&t=2eZigRM0BwNtC5wd-4)
 */

export default function TermsOfServiceScreen() {
  return <LegalDocumentScreen title="Terms of Service" body={LEGAL_TERMS_BODY} />;
}
