import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Navbar } from './components/Navbar';
import { UploadForm } from './components/UploadForm';
import { DocumentList } from './components/DocumentList';
import { DocumentDetail } from './components/DocumentDetail';
import { ReviewInterface } from './components/ReviewInterface';
import { getPendingReviews } from './lib/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const { data: pendingData } = useQuery({
    queryKey: ['pending-reviews'],
    queryFn: getPendingReviews,
    refetchInterval: 10000,
  });

  const handleUploadSuccess = (documentId: string) => {
    setSelectedDocId(documentId);
    setActiveTab('documents');
  };

  const handleViewDocument = (documentId: string) => {
    setSelectedDocId(documentId);
  };

  const handleCloseDetail = () => {
    setSelectedDocId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={pendingData?.total || 0}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload' && (
          <div className="max-w-3xl mx-auto">
            <UploadForm onUploadSuccess={handleUploadSuccess} />
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            {selectedDocId ? (
              <DocumentDetail documentId={selectedDocId} onClose={handleCloseDetail} />
            ) : (
              <DocumentList onViewDocument={handleViewDocument} />
            )}
          </div>
        )}

        {activeTab === 'review' && <ReviewInterface />}
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
