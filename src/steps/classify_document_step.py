import os
import sys
import json
from dotenv import load_dotenv
from groq import Groq

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from utils.database import SessionLocal, Document, DocumentStatus

load_dotenv(".env")

config = {
    'name': 'ClassifyDocument',
    'type': 'event',
    'description': 'Classifies document and extracts key entities using AI',
    'subscribes': ['document.uploaded'],
    'emits': ['document.classified']
}

async def handler(input_data, context):
    """Classify document using Groq AI"""
    
    try:
        document_id = input_data.get('document_id')
        document_type = input_data.get('document_type')
        content = input_data.get('content', '')
        
        context.logger.info(f"🔍 Classifying document: {document_id}")
        
        # Get Groq client
        groq_client = Groq(api_key=os.getenv('GROQ_API_KEY'))
        
        # Classification prompt
        prompt = f"""You are a document classification AI. Analyze the following {document_type} document and extract key information.

Document Content:
{content[:2000]}

Extract the following in JSON format:
- confidence: (float 0-1) Confidence this is a valid {document_type}
- key_entities: List of important entities (names, dates, amounts, locations)
- document_category: Specific subcategory (e.g., "personal_loan", "business_loan", "mortgage")
- requires_review: (boolean) Does this need human review?
- completeness_score: (float 0-1) How complete is the information?

Return ONLY valid JSON, no markdown formatting."""
        
        # Call Groq API
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # CHANGED from llama-3.1-70b-versatile
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=500
        )
        
        result_text = response.choices[0].message.content
        
        # Parse JSON response
        try:
            classification_result = json.loads(result_text)
        except json.JSONDecodeError:
            # Try to extract JSON from markdown code blocks
            import re
            json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
            if json_match:
                classification_result = json.loads(json_match.group())
            else:
                raise ValueError("Could not parse JSON from AI response")
        
        context.logger.info(f"✅ Classification complete: {classification_result.get('document_category', 'unknown')}")
        
        # Update database
        db = SessionLocal()
        document = db.query(Document).filter(Document.document_id == document_id).first()
        
        if document:
            document.classification = json.dumps(classification_result)
            document.status = DocumentStatus.PROCESSING
            db.commit()
        
        db.close()
        
        # Emit event for next step
        await context.emit({
            'topic': 'document.classified',
            'data': {
                'document_id': document_id,
                'document_type': document_type,
                'content': content,
                'classification': classification_result
            }
        })
        
        context.logger.info(f"🚀 Classification event emitted for: {document_id}")
        
    except Exception as e:
        import traceback
        context.logger.error(f"❌ Classification failed: {traceback.format_exc()}")
