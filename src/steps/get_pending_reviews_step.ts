import type { ApiRouteConfig } from 'motia';
import { z } from 'zod';
import { Pool } from 'pg';

const pool = new Pool({
  user: 'docflow',
  host: 'localhost',
  database: 'docflow_db',
  password: 'docflow123',
  port: 5432,
});

export const config: ApiRouteConfig = {
  name: 'GetPendingReviews',
  type: 'api',
  path: '/api/v1/documents/pending-review',
  method: 'GET',
  emits: [],
  flows: ['document-processing-flow'],
  responseSchema: {
    200: z.object({
      documents: z.array(z.object({
        document_id: z.string(),
        filename: z.string(),
        document_type: z.string(),
        risk_score: z.number(),
        ai_summary: z.string().nullable(),
        reviewer_comments: z.string().nullable(),
        uploaded_at: z.string(),
        processed_at: z.string().nullable()
      })),
      total: z.number()
    })
  }
};

export const handler = async (req: any, { logger }: any) => {
  try {
    // Query for documents with status = PENDING_REVIEW
    const result = await pool.query(
      `SELECT document_id, filename, document_type, status, risk_score, 
              ai_summary, reviewer_comments, uploaded_at, processed_at
       FROM documents 
       WHERE status = 'PENDING_REVIEW'
       ORDER BY uploaded_at DESC`,
      []
    );
    
    logger.info(`📋 Found ${result.rows.length} documents pending review`);
    
    return {
      status: 200,
      body: {
        documents: result.rows.map(doc => ({
          document_id: doc.document_id,
          filename: doc.filename,
          document_type: doc.document_type,
          risk_score: doc.risk_score,
          ai_summary: doc.ai_summary,
          reviewer_comments: doc.reviewer_comments,
          uploaded_at: doc.uploaded_at?.toISOString() || new Date().toISOString(),
          processed_at: doc.processed_at?.toISOString() || null
        })),
        total: result.rows.length
      }
    };
    
  } catch (error: any) {
    logger.error(`❌ Error getting pending reviews: ${error.message}`);
    return {
      status: 500,
      body: { error: `Failed to get pending reviews: ${error.message}` }
    };
  }
};
