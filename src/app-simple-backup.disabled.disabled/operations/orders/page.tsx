import { CustomerOrderManagement } from '@/components/operations/CustomerOrderManagement';
import { OperationsLayout } from '@/components/operations/OperationsLayout';

export default function CustomerOrderManagementPage() {
  return (
    <OperationsLayout 
      title="Customer Order Management" 
      description="Complete order-to-cash workflow for cultivation operations"
    >
      <CustomerOrderManagement />
    </OperationsLayout>
  );
}