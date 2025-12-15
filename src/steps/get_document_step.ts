import type { ApiRouteConfig } from 'motia';
import { z } from 'zod';
import { Pool } from 'pg';

// PostgreSQL connection
const pool = new Pool({
  user: 'docflow',
  host: 'localhost',
  database: 'docflow_db',
  password: 'docflow123',
  port: 5432,
});

export const config: ApiRouteConfig = {
  name: 'GetDocument',
  type: 'api',
  path: '/api/v1/documents/:document_id',
  method: 'GET',
  emits: [],
  responseSchema: {
    200: z.object({
      document_id: z.string(),
      filename: z.string(),
      document_type: z.string(),
      status: z.string(),
      extracted_text: z.string().nullable(),
      ai_summary: z.string().nullable(),
      risk_score: z.number().nullable(),
      uploaded_at: z.string(),
      processed_at: z.string().nullable(),
      reviewer_comments: z.string().nullable()
    }),
    404: z.object({
      error: z.string()
    })
  }
};

export const handler = async (req: any, { logger }: any) => {
  try {
    const documentId = req.pathParams.document_id;
    
    if (!documentId) {
      return {
        status: 404,
        body: { error: 'Missing document_id' }
      };
    }
    
    // Query database
    const result = await pool.query(
      'SELECT * FROM documents WHERE document_id = $1',
      [documentId]
    );
    
    if (result.rows.length === 0) {
      logger.warn(`⚠️  Document not found: ${documentId}`);  // FIXED: warning -> warn
      return {
        status: 404,
        body: { error: 'Document not found' }
      };
    }
    
    const doc = result.rows[0];
    
    logger.info(`📊 Retrieved document: ${documentId}`);
    
    return {
      status: 200,
      body: {
        document_id: doc.document_id,
        filename: doc.filename,
        document_type: doc.document_type,
        status: doc.status,
        extracted_text: doc.extracted_text ? 
          (doc.extracted_text.length > 200 ? doc.extracted_text.substring(0, 200) + '...' : doc.extracted_text) 
          : null,
        ai_summary: doc.ai_summary,
        risk_score: doc.risk_score,
        uploaded_at: doc.uploaded_at?.toISOString() || new Date().toISOString(),
        processed_at: doc.processed_at?.toISOString() || null,
        reviewer_comments: doc.reviewer_comments
      }
    };
    
  } catch (error: any) {
    logger.error(`❌ Error retrieving document: ${error.message}`);
    return {
      status: 500,
      body: { error: `Failed to retrieve document: ${error.message}` }
    };
  }
};
