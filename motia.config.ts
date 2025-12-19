export default {
  name: 'docflow-ai',
  version: '1.0.0',
  
  steps: {
    uploadDocument: './src/steps/upload_document_step.ts',
    uploadFile: './src/steps/upload_file_step.ts',
    saveDocument: './src/steps/save_document_step.py',
    classifyDocument: './src/steps/classify_document_step.py',
    summarizeDocument: './src/steps/summarize_document_step.py',
    riskScoreDocument: './src/steps/risk_score_document_step.py',
    getDocument: './src/steps/get_document_step.py',
    listDocuments: './src/steps/list_documents_step.py',
    getPendingReviews: './src/steps/get_pending_reviews_step.py',
    reviewDocument: './src/steps/review_document_step.py',
    deleteDocument: './src/steps/delete_document_step.py',
  },
  
  flows: {
    'document-processing-flow': {
      description: 'AI-powered document processing pipeline',
      steps: [
        'uploadDocument',
        'uploadFile',
        'saveDocument',
        'classifyDocument',
        'summarizeDocument',
        'riskScoreDocument'
      ]
    }
  },
  
  server: {
    port: parseInt(process.env.PORT || '3000'),
    host: '0.0.0.0',
    cors: true
  },
  
  // Redis configuration for production
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  }
};
