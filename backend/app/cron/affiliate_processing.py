from datetime import datetime, timedelta
from app.users.models import AffliliateTransactions
from app.database import db
from app.users.models import User  # Import your User model
from bson import ObjectId

async def process_affiliate_transactions():
    try:
        # Calculate 15 days ago
        cutoff_date = datetime.utcnow() - timedelta(days=15)
        
        # Find eligible transactions using ODMantic
        transactions = await db.engine.find(
            AffliliateTransactions,
            AffliliateTransactions.created_at <= cutoff_date,
            AffliliateTransactions.is_processed == False
        )
        
        processed_count = 0
        
        for transaction in transactions:
            try:
                user_data = await db.engine.find_one(User, User.id == ObjectId(transaction.affiliate_id))
                if (user_data):
                    # Update affiliate balance atomically
                    user_data.balance+= int(transaction.amount)
                    await db.engine.save(user_data)
                    # Mark transaction as processed
                    transaction.is_processed = True
                    transaction.processed_at = datetime.utcnow()
                    await db.engine.save(transaction)
                    
                    processed_count += 1
                
            except Exception as e:
                print(f"Failed to process transaction {transaction.id}: {str(e)}")
        
        return f"Successfully processed {processed_count}/{len(transactions)} transactions"
        
    except Exception as e:
        return "Failed to process transactions"