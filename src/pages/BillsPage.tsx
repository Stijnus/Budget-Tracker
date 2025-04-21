import { useState } from 'react';
import { AppLayout } from '../shared/components/layout';
import { BillList } from '../features/bills/components/BillList';
import { BillDetails } from '../features/bills/components/BillDetails';

export function BillsPage() {
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            Bills & Subscriptions
          </h2>
        </div>
        
        {selectedBillId ? (
          <div>
            <button
              onClick={() => setSelectedBillId(null)}
              className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Bills
            </button>
            
            <BillDetails
              billId={selectedBillId}
              onClose={() => setSelectedBillId(null)}
            />
          </div>
        ) : (
          <BillList showAddButton={true} />
        )}
      </div>
    </AppLayout>
  );
}
