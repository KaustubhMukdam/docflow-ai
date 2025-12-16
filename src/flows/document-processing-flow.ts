import type { FlowConfig } from 'motia';

export const config: FlowConfig = {
  name: 'document-processing-flow',
  description: 'End-to-end AI-powered document processing with human review',
  steps: [
    'UploadDocument',          // Upload document
    'SaveDocument',            // Save to database
    'ClassifyDocument',        // AI classification
    'SummarizeDocument',       // AI summary
    'RiskScoreDocument',       // Risk assessment + conditional routing
    'GetPendingReviews',       // Get documents needing review
    'ReviewDocument',          // Human review decision
    'NotifyReview'             // Send notifications
  ]
};
