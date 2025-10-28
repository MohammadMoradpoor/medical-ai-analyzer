"""
Manual script to delete problematic conversations
"""

import sys
from app.db.session import SessionLocal
from app.db.models import ChatMessage

def delete_conversations_for_report(report_id: str, conversation_ids: list = None):
    """
    Manually delete conversations for a specific report.
    
    Args:
        report_id: The report ID
        conversation_ids: Optional list of specific conversation IDs to delete
    """
    db = SessionLocal()
    
    try:
        if conversation_ids:
            # Delete specific conversations
            for conv_id in conversation_ids:
                print(f'\nDeleting conversation: {conv_id}')
                
                # Step 1: Clear parent_message_id to avoid FK issues
                updated = db.query(ChatMessage).filter(
                    ChatMessage.report_id == report_id,
                    ChatMessage.conversation_id == conv_id
                ).update({'parent_message_id': None})
                db.commit()
                print(f'  Cleared {updated} parent references')
                
                # Step 2: Delete messages
                deleted = db.query(ChatMessage).filter(
                    ChatMessage.report_id == report_id,
                    ChatMessage.conversation_id == conv_id
                ).delete()
                db.commit()
                print(f'  ✅ Deleted {deleted} messages')
        else:
            # Delete all conversations for report
            print(f'\nDeleting ALL conversations for report: {report_id}')
            
            # Clear parent references
            updated = db.query(ChatMessage).filter(
                ChatMessage.report_id == report_id
            ).update({'parent_message_id': None})
            db.commit()
            print(f'  Cleared {updated} parent references')
            
            # Delete all messages
            deleted = db.query(ChatMessage).filter(
                ChatMessage.report_id == report_id
            ).delete()
            db.commit()
            print(f'  ✅ Deleted {deleted} messages')
        
        print('\n✅ Deletion complete!')
        
    except Exception as e:
        print(f'\n❌ Error: {str(e)}')
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python delete_conversations.py <report_id> [conv_id1] [conv_id2] ...")
        print("\nExample:")
        print("  python delete_conversations.py 11ea433c-e16d-4547-bd9f-8c866ab51892")
        print("  python delete_conversations.py 11ea433c-e16d-4547-bd9f-8c866ab51892 conv_123 conv_456")
        sys.exit(1)
    
    report_id = sys.argv[1]
    conversation_ids = sys.argv[2:] if len(sys.argv) > 2 else None
    
    delete_conversations_for_report(report_id, conversation_ids)

