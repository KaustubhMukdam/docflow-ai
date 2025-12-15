import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from utils.database import SessionLocal, Document, DocumentStatus

config = {
    'name': 'ListDocuments',
    'type': 'api',
    'path': '/api/v1/documents',
    'method': 'GET',
    'emits': []
}

async def handler(req, ctx):
    """List all documents with optional status filter"""
    
    try:
        # FIXED: Use correct key names
        status_filter = req['queryParams'].get('status')
        limit = int(req['queryParams'].get('limit', 50))
        
        db = SessionLocal()
        query = db.query(Document)
        
        # Apply status filter if provided
        if status_filter:
            try:
                status_enum = DocumentStatus[status_filter.upper()]
                query = query.filter(Document.status == status_enum)
            except KeyError:
                pass  # Invalid status, ignore filter
        
        # Get documents
        documents = query.order_by(Document.uploaded_at.desc()).limit(limit).all()
        db.close()
        
        ctx.logger.info(f"📋 Listed {len(documents)} documents")
        
        return {
            'status': 200,
            'body': {
                'documents': [
                    {
                        'document_id': doc.document_id,
                        'filename': doc.filename,
                        'document_type': doc.document_type.value if doc.document_type else None,
                        'status': doc.status.value if doc.status else None,
                        'risk_score': doc.risk_score,
                        'uploaded_at': doc.uploaded_at.isoformat() if doc.uploaded_at else None
                    }
                    for doc in documents
                ],
                'total': len(documents),
                'filters_applied': {'status': status_filter} if status_filter else {}
            }
        }
        
    except Exception as e:
        import traceback
        ctx.logger.error(f"❌ Error listing documents: {traceback.format_exc()}")
        return {
            'status': 500,
            'body': {'error': f'Failed to list documents: {str(e)}'}
        }
