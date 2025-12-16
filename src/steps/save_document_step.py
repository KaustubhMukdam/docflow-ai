import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from utils.database import SessionLocal, Document, DocumentType, DocumentStatus
from datetime import datetime

config = {
    'name': 'SaveDocument',
    'type': 'event',
    'description': 'Saves uploaded document to database',
    'subscribes': ['document.uploaded'],
    'emits': [],
    'flows': ['document-processing-flow']
}

async def handler(input_data, context):
    """Save document metadata to database"""
    
    try:
        document_id = input_data.get('document_id')
        filename = input_data.get('filename')
        document_type = input_data.get('document_type')
        file_path = input_data.get('file_path', '')
        content = input_data.get('content', '')
        
        context.logger.info(f"💾 Saving document to database: {document_id}")
        
        # Save to database
        db = SessionLocal()
        
        try:
            doc_type = DocumentType[document_type.upper()]
        except KeyError:
            context.logger.error(f"Invalid document type: {document_type}")
            db.close()
            return
        
        # Check if document already exists
        existing_doc = db.query(Document).filter(Document.document_id == document_id).first()
        
        if existing_doc:
            context.logger.warning(f"Document {document_id} already exists, skipping save")
            db.close()
            return
        
        # Create new document record
        db_document = Document(
            document_id=document_id,
            filename=filename,
            document_type=doc_type,
            status=DocumentStatus.UPLOADED,
            file_path=file_path,
            uploaded_at=datetime.utcnow(),
            file_size=input_data.get('file_size'),
            file_type=input_data.get('file_type') 
        )
        
        # If content was passed, store it as extracted_text for now
        if content:
            db_document.extracted_text = content
        
        db.add(db_document)
        db.commit()
        db.refresh(db_document)
        db.close()
        
        context.logger.info(f"✅ Document saved to database: {document_id}")
        
    except Exception as e:
        import traceback
        context.logger.error(f"❌ Failed to save document: {traceback.format_exc()}")
