import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';
import { randomBytes } from 'crypto';

export const config: ApiRouteConfig = {
  name: 'UploadDocument',
  type: 'api',
  path: '/api/v1/documents/upload',
  method: 'POST',
  emits: ['document.uploaded'],
  responseSchema: {
    201: z.object({
      document_id: z.string(),
      filename: z.string(),
      status: z.string(),
      message: z.string()
    }),
    400: z.object({
      error: z.string()
    }),
    500: z.object({
      error: z.string()
    })
  }
};

export const handler: Handlers['UploadDocument'] = async (req, { emit, logger }) => {
  try {
    // Access body data
    const filename = req.body.filename as string;
    const documentType = req.body.document_type as string;
    const content = req.body.content as string;
    
    if (!filename || !documentType) {
      return {
        status: 400,
        body: {
          error: 'Missing filename or document_type'
        }
      };
    }
    
    // Generate document ID
    const documentId = `doc_${randomBytes(6).toString('hex')}`;
    
    logger.info(`📄 Document uploaded: ${documentId} (${filename})`);
    
    // Emit event for processing
    await emit({
      topic: 'document.uploaded',
      data: {
        document_id: documentId,
        document_type: documentType,
        filename: filename,
        content: content || ''
      }
    });
    
    logger.info(`🚀 Processing workflow triggered for: ${documentId}`);
    
    return {
      status: 201,
      body: {
        document_id: documentId,
        filename: filename,
        status: 'uploaded',
        message: 'Document uploaded successfully. Processing started.'
      }
    };
    
  } catch (error: any) {
    logger.error(`❌ Upload failed: ${error.message}`);
    return {
      status: 500,
      body: { 
        error: `Upload failed: ${error.message}` 
      }
    };
  }
};
