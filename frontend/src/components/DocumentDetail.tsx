import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDocument } from '../lib/api';
import { StatusBadge } from './StatusBadge';

interface Props {
  documentId: string;
  onClose: () => void;
}

export const DocumentDetail: React.FC<Props> = ({ documentId, onClose }) => {
  const { data: document, isLoading, error } = useQuery({
    queryKey: ['document', documentId],
    queryFn: () => getDocument(documentId),
    refetchInterval: 3000, // Refresh every 3 seconds while processing
  });

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="ml-3 text-gray-600">Loading document...</span>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="card">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">❌ Failed to load document</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{document.filename}</h2>
          <p className="text-sm text-gray-500 mt-1">ID: {document.document_id}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-6">
        {/* Status Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Status</h3>
          <div className="flex items-center gap-4">
            <StatusBadge status={document.status} />
            {document.risk_score !== null && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Risk Score:</span>
                <span className={`text-lg font-bold ${
                  document.risk_score < 30 ? 'text-green-600' :
                  document.risk_score < 70 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {document.risk_score}/100
                </span>
              </div>
            )}
          </div>
        </div>

        {/* AI Summary */}
        {document.ai_summary && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">📝 AI Summary</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{document.ai_summary}</div>
            </div>
          </div>
        )}

        {/* Classification */}
        {document.classification && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">🔍 Classification</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <pre className="text-sm text-gray-700 overflow-x-auto">
                {JSON.stringify(JSON.parse(document.classification), null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Reviewer Comments */}
        {document.reviewer_comments && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">💬 Reviewer Comments</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">{document.reviewer_comments}</p>
            </div>
          </div>
        )}

        {/* Document Content */}
        {document.extracted_text && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">📄 Document Content</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                {document.extracted_text}
              </pre>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">ℹ️ Metadata</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Document Type:</span>
              <p className="text-sm font-medium text-gray-900">{document.document_type.replace('_', ' ')}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Uploaded At:</span>
              <p className="text-sm font-medium text-gray-900">{new Date(document.uploaded_at).toLocaleString()}</p>
            </div>
            {document.processed_at && (
              <div>
                <span className="text-sm text-gray-500">Processed At:</span>
                <p className="text-sm font-medium text-gray-900">{new Date(document.processed_at).toLocaleString()}</p>
              </div>
            )}
            {document.approved_at && (
              <div>
                <span className="text-sm text-gray-500">Approved At:</span>
                <p className="text-sm font-medium text-gray-900">{new Date(document.approved_at).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
