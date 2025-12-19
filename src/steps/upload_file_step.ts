import type { ApiRouteConfig } from 'motia';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

export const config: ApiRouteConfig = {
  name: 'UploadFile',
  type: 'api',
  path: '/api/v1/documents/upload-file',
  method: 'POST',
  emits: ['document.uploaded'],
  flows: ['document-processing-flow'],
  responseSchema: {
    201: z.object({
      document_id: z.string(),
      filename: z.string(),
      file_type: z.string(),
      file_size: z.number(),
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

export const handler = async (req: any, { emit, logger }: any) => {
  try {
    const { filename, document_type, file_data } = req.body;
    
    if (!filename || !file_data) {
      return {
        status: 400,
        body: { error: 'Missing filename or file_data (base64)' }
      };
    }

    const documentType = document_type || 'general';
    logger.info(`📁 File upload initiated: ${filename}`);

    // For now, only support TXT files (PDF/DOCX coming in frontend)
    const allowedExtensions = ['txt'];
    const fileExtension = filename.toLowerCase().split('.').pop();
    
    if (!allowedExtensions.includes(fileExtension || '')) {
      return {
        status: 400,
        body: { 
          error: `Currently only TXT files supported via this endpoint. Use /upload for JSON text.` 
        }
      };
    }

    // Decode base64
    let fileBuffer: Buffer;
    try {
      fileBuffer = Buffer.from(file_data, 'base64');
    } catch (error) {
      return {
        status: 400,
        body: { error: 'Invalid base64 data' }
      };
    }
    
    const fileSize = fileBuffer.length;
    
    // Validate file size
    const maxSize = 10 * 1024 * 1024;
    if (fileSize > maxSize) {
      return {
        status: 400,
        body: { error: 'File too large. Maximum size: 10MB' }
      };
    }

    // Create directories
    // ✅ Use /tmp in production, ./uploads in development
    const UPLOAD_DIR = process.env.NODE_ENV === 'production' 
      ? '/tmp/uploads' 
      : join(process.cwd(), 'uploads');

    // ✅ Ensure directory exists
    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true });
    }


    // Generate document ID and save file
    const documentId = `doc_${randomBytes(6).toString('hex')}`;
    const savedFilename = `${documentId}_${filename}`;
    const filePath = join(UPLOAD_DIR, savedFilename);
    
    try {
      writeFileSync(filePath, fileBuffer);
      logger.info(`💾 File saved: ${filePath}`);
    } catch (error: any) {
      return {
        status: 500,
        body: { error: `Failed to save file: ${error.message}` }
      };
    }

    // Extract text (TXT only - simple read)
    let extractedText = '';
    try {
      extractedText = readFileSync(filePath, 'utf-8').trim();
      
      if (!extractedText || extractedText.length === 0) {
        throw new Error('No text content found in file');
      }
      
      logger.info(`📝 Extracted ${extractedText.length} characters from TXT`);
      
    } catch (extractError: any) {
      logger.error(`Text extraction failed: ${extractError.message}`);
      return {
        status: 500,
        body: { 
          error: `Failed to extract text: ${extractError.message}` 
        }
      };
    }

    // Emit processing event
    await emit({
      topic: 'document.uploaded',
      data: {
        document_id: documentId,
        document_type: documentType,
        filename: filename,
        content: extractedText,
        file_path: filePath,
        file_size: fileSize,
        file_type: fileExtension
      }
    });

    logger.info(`🚀 Processing started for: ${documentId}`);

    return {
      status: 201,
      body: {
        document_id: documentId,
        filename: filename,
        file_type: fileExtension || 'unknown',
        file_size: fileSize,
        status: 'uploaded',
        message: 'File uploaded and processing started.'
      }
    };

  } catch (error: any) {
    logger.error(`❌ Upload failed: ${error.message}`);
    return {
      status: 500,
      body: { error: `Upload failed: ${error.message}` }
    };
  }
};
