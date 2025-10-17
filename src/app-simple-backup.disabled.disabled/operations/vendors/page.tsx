import { VendorManagement } from '@/components/operations/VendorManagement';
import { OperationsLayout } from '@/components/operations/OperationsLayout';

export default function VendorManagementPage() {
  return (
    <OperationsLayout 
      title="Vendor Management" 
      description="Comprehensive supply chain and vendor relationship management"
    >
      <VendorManagement />
    </OperationsLayout>
  );
}