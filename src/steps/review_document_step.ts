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
  name: 'ReviewDocument',
  type: 'api',
  path: '/api/v1/documents/:document_id/review',
  method: 'POST',
  emits: ['document.reviewed'],
  flows: ['document-processing-flow'],
  responseSchema: {
    200: z.object({
      document_id: z.string(),
      decision: z.enum(['approved', 'rejected']),
      message: z.string()
    }),
    400: z.object({
      error: z.string()
    }),
    404: z.object({
      error: z.string()
    })
  }
};

export const handler = async (req: any, { logger, emit }: any) => {
  try {
    const documentId = req.pathParams.document_id;
    const decision = req.body.decision as string; // 'approve' or 'reject'
    const reviewerName = req.body.reviewer_name as string;
    const comments = req.body.comments as string;
    
    if (!decision || !['approve', 'reject'].includes(decision)) {
      return {
        status: 400,
        body: { error: 'Invalid decision. Must be "approve" or "reject"' }
      };
    }
    
    // Get current document
    const docResult = await pool.query(
      'SELECT * FROM documents WHERE document_id = $1',
      [documentId]
    );
    
    if (docResult.rows.length === 0) {
      logger.warn(`⚠️  Document not found: ${documentId}`);
      return {
        status: 404,
        body: { error: 'Document not found' }
      };
    }
    
    const newStatus = decision === 'approve' ? 'APPROVED' : 'REJECTED';
    const reviewComment = `Human Review by ${reviewerName || 'Unknown'}: ${decision.toUpperCase()}. ${comments || 'No comments provided.'}`;
    
    // Update document status
    await pool.query(
      `UPDATE documents 
       SET status = $1, 
           reviewer_comments = $2,
           approved_at = $3
       WHERE document_id = $4`,
      [newStatus, reviewComment, new Date(), documentId]
    );
    
    logger.info(`Emitting document.reviewed event for ${documentId}`);
    
    // Emit event for notifications/webhooks
    await emit({
      topic: 'document.reviewed',
      data: {
        document_id: documentId,
        decision: decision,
        reviewer_name: reviewerName,
        comments: comments,
        status: newStatus
      }
    });

    logger.info(`Event emitted successfully for ${documentId}`);
    
    return {
      status: 200,
      body: {
        document_id: documentId,
        decision: decision === 'approve' ? 'approved' : 'rejected',
        message: `Document ${decision}d successfully`
      }
    };
    
  } catch (error: any) {
    logger.error(`❌ Error reviewing document: ${error.message}`);
    return {
      status: 500,
      body: { error: `Failed to review document: ${error.message}` }
    };
  }
};
