import os
import sys
from dotenv import load_dotenv
from groq import Groq

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from utils.database import SessionLocal, Document

load_dotenv(".env")

config = {
    'name': 'SummarizeDocument',
    'type': 'event',
    'description': 'Generates AI summary of document',
    'subscribes': ['document.classified'],
    'emits': ['document.summarized'],
    'flows': ['document-processing-flow']
}

async def handler(input_data, context):
    """Generate AI summary using Groq"""
    
    try:
        document_id = input_data.get('document_id')
        document_type = input_data.get('document_type')
        content = input_data.get('content', '')
        classification = input_data.get('classification', {})
        
        context.logger.info(f"📝 Generating summary for: {document_id}")
        
        # Get Groq client
        groq_client = Groq(api_key=os.getenv('GROQ_API_KEY'))
        
        # Get key entities from classification
        key_entities = classification.get('key_entities', [])
        entities_text = "\n".join([f"- {entity}" for entity in key_entities])
        
        # Summarization prompt
        prompt = f"""You are a financial document analyst. Create a concise, professional summary of this {document_type}.

Document Content:
{content[:3000]}

Key Entities Already Identified:
{entities_text}

Provide a structured summary with:
1. **Overview** (2-3 sentences): What is this document about?
2. **Key Details**: Most important information (amounts, dates, parties involved)
3. **Action Items**: What decisions need to be made?
4. **Red Flags**: Any concerns or unusual items?

Keep the summary under 300 words. Use bullet points for clarity. Be professional and concise."""
        
        # Call Groq API
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # CHANGED from llama-3.1-70b-versatile
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=500
        )
        
        summary = response.choices[0].message.content
        
        context.logger.info(f"✅ Summary generated ({len(summary)} chars)")
        
        # Update database
        db = SessionLocal()
        document = db.query(Document).filter(Document.document_id == document_id).first()
        
        if document:
            document.ai_summary = summary
            db.commit()
        
        db.close()
        
        # Emit event for risk scoring
        await context.emit({
            'topic': 'document.summarized',
            'data': {
                'document_id': document_id,
                'document_type': document_type,
                'content': content,
                'classification': classification,
                'summary': summary
            }
        })
        
        context.logger.info(f"🚀 Summary event emitted for: {document_id}")
        
    except Exception as e:
        import traceback
        context.logger.error(f"❌ Summarization failed: {traceback.format_exc()}")
