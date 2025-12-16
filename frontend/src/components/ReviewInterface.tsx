import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingReviews, reviewDocument, getDocument } from '../lib/api';
import { StatusBadge } from './StatusBadge';

export const ReviewInterface: React.FC = () => {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [reviewerName, setReviewerName] = useState('');
  const [comments, setComments] = useState('');
  
  const queryClient = useQueryClient();

  // Fetch pending reviews
  const { data: pendingData, isLoading, error, refetch } = useQuery({
    queryKey: ['pending-reviews'],
    queryFn: async () => {
      console.log('Fetching pending reviews...');
      const result = await getPendingReviews();
      console.log('Pending reviews result:', result);
      return result;
    },
    refetchInterval: 5000,
  });

  // Fetch selected document details
  const { data: selectedDoc } = useQuery({
    queryKey: ['document', selectedDocId],
    queryFn: () => getDocument(selectedDocId!),
    enabled: !!selectedDocId,
  });

  // Review mutation
  const reviewMutation = useMutation({
    mutationFn: ({ documentId, decision }: { documentId: string; decision: 'approve' | 'reject' }) =>
      reviewDocument(documentId, {
        decision,
        reviewer_name: reviewerName || 'Anonymous Reviewer',
        comments: comments || 'No comments provided',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setSelectedDocId(null);
      setReviewerName('');
      setComments('');
      alert('✅ Review submitted successfully!');
    },
    onError: (error: any) => {
      alert(`❌ Review failed: ${error.message}`);
    }
  });

  const handleReview = (decision: 'approve' | 'reject') => {
    if (!selectedDocId) {
      alert('Please select a document to review');
      return;
    }
    if (!reviewerName.trim()) {
      alert('Please enter your name');
      return;
    }
    
    const confirmMessage = decision === 'approve' 
      ? 'Are you sure you want to APPROVE this document?'
      : 'Are you sure you want to REJECT this document?';
    
    if (confirm(confirmMessage)) {
      reviewMutation.mutate({ documentId: selectedDocId, decision });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="ml-3 text-gray-600">Loading reviews...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold text-red-600 mb-4">❌ Error Loading Reviews</h2>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 mb-2">
            Error: {(error as Error).message}
          </p>
          <button onClick={() => refetch()} className="btn-primary mt-4">
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  // Get documents array
  const pendingDocs = pendingData?.documents || [];
  const totalPending = pendingData?.total || 0;

  return (
    <div className="space-y-6">
      {/* Pending Documents List */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              👤 Review Queue
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {totalPending} {totalPending === 1 ? 'document' : 'documents'} pending review
            </p>
          </div>
          <button 
            onClick={() => refetch()} 
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {pendingDocs.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending reviews</h3>
            <p className="mt-1 text-sm text-gray-500">All documents have been processed!</p>
            <p className="mt-2 text-xs text-gray-400">Upload a high-risk document to test the review workflow.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingDocs.map((doc: any) => (
              <div
                key={doc.document_id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedDocId === doc.document_id
                    ? 'border-primary-500 bg-primary-50 shadow-md'
                    : 'border-gray-200 hover:border-primary-300 hover:shadow-sm'
                }`}
                onClick={() => setSelectedDocId(doc.document_id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{doc.filename}</h3>
                      {selectedDocId === doc.document_id && (
                        <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded">Selected</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 capitalize">
                      {doc.document_type.replace('_', ' ').toLowerCase()}
                    </p>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600">Risk:</span>
                        <span className={`text-lg font-bold ${
                          doc.risk_score < 30 ? 'text-green-600' :
                          doc.risk_score < 70 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {doc.risk_score}/100
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Uploaded: {new Date(doc.uploaded_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="badge badge-warning">⏸️ PENDING REVIEW</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Panel */}
      {selectedDocId && selectedDoc && (
        <div className="card border-2 border-primary-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>📋</span>
            <span>Review: {selectedDoc.filename}</span>
          </h3>

          {/* Risk Score Alert */}
          {selectedDoc.risk_score && selectedDoc.risk_score >= 70 && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⚠️</span>
                <span className="font-bold text-red-800">HIGH RISK DETECTED</span>
              </div>
              <p className="text-sm text-red-700">
                This document has a risk score of <strong>{selectedDoc.risk_score}/100</strong>. 
                Please review carefully before making a decision.
              </p>
            </div>
          )}

          {/* AI Summary */}
          {selectedDoc.ai_summary && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span>🤖</span>
                <span>AI Analysis Summary:</span>
              </h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{selectedDoc.ai_summary}</div>
              </div>
            </div>
          )}

          {/* Reviewer Comments (from system) */}
          {selectedDoc.reviewer_comments && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">System Concerns:</h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">{selectedDoc.reviewer_comments}</p>
              </div>
            </div>
          )}

          {/* Reviewer Form */}
          <div className="space-y-4 mt-6 pt-6 border-t-2 border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Comments
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                placeholder="Enter your review comments and reasoning..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleReview('approve')}
                disabled={reviewMutation.isPending || !reviewerName.trim()}
                className="flex-1 btn-success disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>✅</span>
                <span>{reviewMutation.isPending ? 'Submitting...' : 'Approve Document'}</span>
              </button>
              <button
                onClick={() => handleReview('reject')}
                disabled={reviewMutation.isPending || !reviewerName.trim()}
                className="flex-1 btn-danger disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>❌</span>
                <span>{reviewMutation.isPending ? 'Submitting...' : 'Reject Document'}</span>
              </button>
            </div>

            {!reviewerName.trim() && (
              <p className="text-xs text-red-600 text-center">
                * Please enter your name to enable review actions
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
