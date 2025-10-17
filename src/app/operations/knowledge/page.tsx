import { KnowledgeManagement } from '@/components/operations/KnowledgeManagement';
export const dynamic = 'force-dynamic';
import { OperationsLayout } from '@/components/operations/OperationsLayout';

export default function KnowledgeManagementPage() {
  return (
    <OperationsLayout 
      title="Knowledge Management" 
      description="Standard Operating Procedures and training resources"
    >
      <KnowledgeManagement />
    </OperationsLayout>
  );
}