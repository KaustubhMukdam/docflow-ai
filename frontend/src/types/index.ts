export type DocumentStatus = 
  | 'UPLOADED' 
  | 'PROCESSING' 
  | 'PENDING_REVIEW' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'FAILED';

export type DocumentType = 
  | 'loan_application' 
  | 'legal_contract' 
  | 'grant_application' 
  | 'insurance_claim';

export interface Document {
  document_id: string;
  filename: string;
  document_type: string;
  status: string;  // Changed from DocumentStatus to string to match API
  risk_score: number | null;
  ai_summary: string | null;
  extracted_text: string | null;
  reviewer_comments: string | null;
  classification: string | null;
  uploaded_at: string;
  processed_at: string | null;
  approved_at: string | null;
  file_size?: number;
  file_type?: string;
}
