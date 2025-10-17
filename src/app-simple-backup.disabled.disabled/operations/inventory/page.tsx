import { EnhancedInventoryManagement } from '@/components/operations/EnhancedInventoryManagement';
import { OperationsLayout } from '@/components/operations/OperationsLayout';

export default function InventoryManagementPage() {
  return (
    <OperationsLayout 
      title="Enhanced Inventory Management" 
      description="Comprehensive cultivation supply chain management"
    >
      <EnhancedInventoryManagement />
    </OperationsLayout>
  );
}