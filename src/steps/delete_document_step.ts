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
  name: 'DeleteDocument',
  type: 'api',
  path: '/api/v1/documents/:document_id',
  method: 'DELETE',
  emits: [],
  responseSchema: {
    200: z.object({
      message: z.string(),
      document_id: z.string()
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
    
    // Delete from database
    const result = await pool.query(
      'DELETE FROM documents WHERE document_id = $1 RETURNING document_id',
      [documentId]
    );
    
    if (result.rows.length === 0) {
      logger.warn(`⚠️  Document not found: ${documentId}`);
      return {
        status: 404,
        body: { error: 'Document not found' }
      };
    }
    
    logger.info(`🗑️  Deleted document: ${documentId}`);
    
    return {
      status: 200,
      body: {
        message: 'Document deleted successfully',
        document_id: documentId
      }
    };
    
  } catch (error: any) {
    logger.error(`❌ Error deleting document: ${error.message}`);
    return {
      status: 500,
      body: { error: `Failed to delete document: ${error.message}` }
    };
  }
};
