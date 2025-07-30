// Stub component for SEO Audit Form
import { AuditUrlInput } from '@/lib/neuroseo/types';

interface SeoAuditFormProps {
    onSubmit: (values: AuditUrlInput) => Promise<void>;
    isLoading: boolean;
}

export default function SeoAuditForm({ onSubmit, isLoading }: SeoAuditFormProps) {
    return <div>SEO Audit Form Placeholder</div>;
}
