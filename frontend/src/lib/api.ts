import axios from 'axios';
import type { Document } from '../types';  // Import from types instead

const API_BASE_URL = import.meta.env.VITE_API_URL || 
                     (import.meta.env.MODE === 'production' 
                       ? window.location.origin 
                       : 'http://localhost:3000');

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Remove the duplicate Document interface - use the one from types/index.ts

export interface UploadResponse {
  document_id: string;
  filename: string;
  status: string;
  message: string;
}

export interface PendingReview {
  documents: Document[];
  total: number;
}

// API Functions
export const uploadDocument = async (data: {
  filename: string;
  document_type: string;
  content: string;
}): Promise<UploadResponse> => {
  const response = await api.post('/documents/upload', data);
  return response.data;
};

export const uploadFile = async (data: {
  filename: string;
  document_type: string;
  file_data: string;
}): Promise<UploadResponse> => {
  const response = await api.post('/documents/upload-file', data);
  return response.data;
};

export const getDocument = async (documentId: string): Promise<Document> => {
  const response = await api.get(`/documents/${documentId}`);
  return response.data;
};

export const listDocuments = async (status?: string): Promise<{ documents: Document[]; total: number }> => {
  const params = status ? { status } : {};
  const response = await api.get('/documents', { params });
  return response.data;
};

export const getPendingReviews = async (): Promise<PendingReview> => {
  const response = await api.get('/documents/pending-review');
  return response.data;
};

export const reviewDocument = async (
  documentId: string,
  data: {
    decision: 'approve' | 'reject';
    reviewer_name: string;
    comments: string;
  }
) => {
  const response = await api.post(`/documents/${documentId}/review`, data);
  return response.data;
};

export const deleteDocument = async (documentId: string) => {
  const response = await api.delete(`/documents/${documentId}`);
  return response.data;
};
