import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

config = {
    'name': 'NotifyReview',
    'type': 'event',
    'description': 'Notifies stakeholders when document review is complete',
    'subscribes': ['document.reviewed'],
    'emits': [],
    'flows': ['document-processing-flow']
}

async def handler(input_data, context):
    """Send notification when document is reviewed"""
    
    try:
        document_id = input_data.get('document_id')
        decision = input_data.get('decision')
        reviewer_name = input_data.get('reviewer_name', 'Unknown')
        comments = input_data.get('comments', 'No comments')
        status = input_data.get('status')
        
        context.logger.info(f"📧 Sending review notification for: {document_id}")
        
        # In production, send email/Slack/webhook here
        notification_message = f"""
Document Review Complete
========================
Document ID: {document_id}
Decision: {decision.upper()}
Reviewer: {reviewer_name}
Comments: {comments}
Final Status: {status}
        """
        
        context.logger.info(f"📨 Notification sent:\n{notification_message}")
        
        # TODO: Integrate with email service (SendGrid, AWS SES, etc.)
        # TODO: Integrate with Slack/Discord webhooks
        # TODO: Store notification history
        
        context.logger.info(f"✅ Review notification complete for: {document_id}")
        
    except Exception as e:
        import traceback
        context.logger.error(f"❌ Notification failed: {traceback.format_exc()}")
