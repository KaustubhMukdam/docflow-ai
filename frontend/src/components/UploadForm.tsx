import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { uploadDocument, uploadFile } from '../lib/api';

interface Props {
  onUploadSuccess: (documentId: string) => void;
}

export const UploadForm: React.FC<Props> = ({ onUploadSuccess }) => {
  const [uploadMode, setUploadMode] = useState<'text' | 'file'>('text');
  const [filename, setFilename] = useState('');
  const [documentType, setDocumentType] = useState('loan_application');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (uploadMode === 'text') {
        return uploadDocument({
          filename: filename || 'document.txt',
          document_type: documentType,
          content: content,
        });
      } else {
        if (!file) throw new Error('No file selected');
        
        const base64 = await fileToBase64(file);
        
        return uploadFile({
          filename: file.name,
          document_type: documentType,
          file_data: base64,
        });
      }
    },
    onSuccess: (data) => {
      onUploadSuccess(data.document_id);
      setFilename('');
      setContent('');
      setFile(null);
    },
  });

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadMode === 'text' && !content.trim()) {
      alert('Please enter document content');
      return;
    }
    
    if (uploadMode === 'file' && !file) {
      alert('Please select a file');
      return;
    }
    
    uploadMutation.mutate();
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">📄 Upload Document</h2>
      
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setUploadMode('text')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            uploadMode === 'text'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ✍️ Text Input
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('file')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            uploadMode === 'file'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📁 File Upload
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="loan_application">💰 Loan Application</option>
            <option value="legal_contract">📜 Legal Contract</option>
            <option value="grant_application">🎓 Grant Application</option>
            <option value="insurance_claim">🏥 Insurance Claim</option>
          </select>
        </div>

        {uploadMode === 'text' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filename (Optional)
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="document.txt"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                placeholder="Paste your document content here..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File (.txt only)
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {file ? (
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">{file.name}</span> ({(file.size / 1024).toFixed(2)} KB)
                    </p>
                  ) : (
                    <>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">TXT files (MAX. 10MB)</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".txt"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={uploadMutation.isPending}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploadMutation.isPending ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Uploading...</span>
            </>
          ) : (
            <span>🚀 Upload & Process</span>
          )}
        </button>

        {uploadMutation.isError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              ❌ Upload failed: {(uploadMutation.error as Error).message}
            </p>
          </div>
        )}

        {uploadMutation.isSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ Document uploaded successfully! Processing started...
            </p>
          </div>
        )}
      </form>
    </div>
  );
};
