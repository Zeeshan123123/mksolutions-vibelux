import { ComplianceWorkflowEngine } from '@/components/operations/ComplianceWorkflowEngine';
import { OperationsLayout } from '@/components/operations/OperationsLayout';

export default function ComplianceWorkflowPage() {
  return (
    <OperationsLayout 
      title="Compliance Workflow Engine" 
      description="Automated regulatory compliance management"
    >
      <ComplianceWorkflowEngine />
    </OperationsLayout>
  );
}