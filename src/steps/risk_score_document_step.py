import os
import sys
import json
import re
from datetime import datetime
from dotenv import load_dotenv
from groq import Groq

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from utils.database import SessionLocal, Document, DocumentStatus

load_dotenv(".env")

config = {
    'name': 'RiskScoreDocument',
    'type': 'event',
    'description': 'Calculates risk score and routes document based on risk level',
    'subscribes': ['document.summarized'],
    'emits': []
}

async def handler(input_data, context):
    """Calculate risk score and conditionally route"""
    
    try:
        document_id = input_data.get('document_id')
        document_type = input_data.get('document_type')
        content = input_data.get('content', '')
        classification = input_data.get('classification', {})
        summary = input_data.get('summary', '')
        
        context.logger.info(f"⚖️  Calculating risk score for: {document_id}")
        
        # Get Groq client
        groq_client = Groq(api_key=os.getenv('GROQ_API_KEY'))
        
        # Risk scoring prompt
        prompt = f"""You are a risk assessment AI for {document_type} documents. Analyze the following and assign a risk score.

Document Summary:
{summary[:1000]}

Classification Info:
{json.dumps(classification, indent=2)}

Evaluate risk factors:
1. **Completeness**: Is all required information present? (0-25 points)
2. **Compliance**: Does it meet regulatory standards? (0-25 points)
3. **Financial Viability**: Are amounts/terms reasonable? (0-25 points)
4. **Red Flags**: Any suspicious or concerning items? (0-25 points)

Return ONLY a JSON object with this exact structure:
{{
  "total_score": <0-100>,
  "risk_level": "low|medium|high|critical",
  "factors": {{
    "completeness": <0-25>,
    "compliance": <0-25>,
    "financial_viability": <0-25>,
    "red_flags": <0-25>
  }},
  "concerns": ["list of specific concerns"],
  "recommendations": ["list of recommendations"]
}}

Higher score = HIGHER risk (0 = safe, 100 = dangerous). Return ONLY valid JSON."""
        
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
            risk_result = json.loads(result_text)
        except json.JSONDecodeError:
            # Try to extract JSON from markdown code blocks
            json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
            if json_match:
                risk_result = json.loads(json_match.group())
            else:
                # Fallback default score
                risk_result = {
                    "total_score": 50,
                    "risk_level": "medium",
                    "factors": {"completeness": 12, "compliance": 12, "financial_viability": 13, "red_flags": 13},
                    "concerns": ["Automated scoring failed"],
                    "recommendations": ["Manual review required"]
                }
        
        total_score = risk_result.get('total_score', 50)
        risk_level = risk_result.get('risk_level', 'medium')
        
        context.logger.info(f"📊 Risk Score: {total_score}/100 ({risk_level})")
        
        # Update database with conditional routing
        db = SessionLocal()
        document = db.query(Document).filter(Document.document_id == document_id).first()
        
        if document:
            document.risk_score = float(total_score)
            document.processed_at = datetime.utcnow()
            
            # Conditional routing based on risk level
            if total_score >= 70:  # High risk if score >= 70
                document.status = DocumentStatus.PENDING_REVIEW
                document.reviewer_comments = f"⚠️ High risk detected (Score: {total_score}/100, Level: {risk_level}). {', '.join(risk_result.get('concerns', []))}"
                context.logger.warning(f"⚠️  HIGH RISK DETECTED! Document {document_id} routed to manual review")
            else:
                document.status = DocumentStatus.APPROVED
                document.approved_at = datetime.utcnow()
                document.reviewer_comments = f"✅ Auto-approved (Risk Score: {total_score}/100, Level: {risk_level}). Lower score = lower risk."
                context.logger.info(f"✅ LOW RISK - Document {document_id} auto-approved")
            
            db.commit()
        
        db.close()
        
        context.logger.info(f"🎯 Processing complete for: {document_id}")
        
    except Exception as e:
        import traceback
        context.logger.error(f"❌ Risk scoring failed: {traceback.format_exc()}")
