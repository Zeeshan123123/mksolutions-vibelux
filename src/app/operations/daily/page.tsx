import { DailyOperations } from '@/components/operations/DailyOperations';
import { OperationsLayout } from '@/components/operations/OperationsLayout';

export default function DailyOperationsPage() {
  return (
    <OperationsLayout 
      title="Daily Operations" 
      description="Comprehensive daily operational management and workflow coordination"
    >
      <DailyOperations />
    </OperationsLayout>
  );
}