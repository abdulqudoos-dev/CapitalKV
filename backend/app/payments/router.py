from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from app.users.utils import get_current_user, update_user_profile
from app.contact.utils import send_contact_email
from app.payments.models import (
    PricesByIds,
    SubscribePlans,
    PaymentMethod,
    UnSubscribeRequest,
    CreatePaymentIntentRequest,
)
from app.users.models import AffliliateTransactions,User
from app.payments.utils import generate_customer_id
from app.database import db
from app.config import settings
from datetime import datetime, timedelta
import stripe
from stripe.error import StripeError
from bson import ObjectId


payment_router = APIRouter()
stripe.api_key = settings.stripe_api_key


@payment_router.get("/plans")
async def get_plans():
    try:
        # Fetch active prices and expand product details
        prices = stripe.Price.list(active=True, expand=["data.product"])

        # Extract plans with valid recurring prices
        plans = []
        plans_data = sorted(
            prices.data,
            key=lambda plan: int(
                plan.product["metadata"].get("order", 0)
            ),  # Sort by display_order metadata
        )

        for price in plans_data:
            # Ensure this is a recurring price and the product is not archived
            if price.recurring and not price.product.get("archived", False):
                print(price)
                plans.append(
                    {
                        "id": price.product.get("id"),
                        "name": price.product.get("name"),
                        "features": price.product.get("marketing_features", []),
                        "price": price.unit_amount / 100,  # Convert to dollars
                        "interval": price.recurring["interval"],
                        "type": price.product.get("metadata", {}).get("type"),
                        "active": price.active
                        and price.product.get(
                            "active", False
                        ),  # Correct active status check
                    }
                )

        return {"plans": plans}

    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@payment_router.post("/get_by_ids")
async def get_plans(data: PricesByIds):
    try:
        # Extract plans with valid recurring prices
        plans = []

        for product_id in data.products:
            prices = stripe.Price.list(
                product=product_id, active=True, expand=["data.product"]
            )
            for price in prices.data:
                plans.append(
                    {
                        "id": price.product.get("id"),
                        "name": price.product.get("name"),
                        "features": price.product.get("marketing_features", []),
                        "price": price.unit_amount / 100,  # Convert to dollars
                        "interval": price.recurring["interval"],
                    }
                )

        return {"plans": plans}

    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@payment_router.post("/set-payment-method")
async def create_payment_method(
    data: PaymentMethod, user: User = Depends(get_current_user)
):
    try:
        customer_id = user.customer_id
        if not customer_id:
            customer_id = await generate_customer_id(user.email)

            # Attach payment method to customer
        payment_method = stripe.PaymentMethod.attach(
            data.id,
            customer=customer_id,
        )
        stripe.Customer.modify(
            customer_id,
            invoice_settings={"default_payment_method": data.id},
        )
        return {"success": True, "paymentMethodId": payment_method.id}
    except stripe.error.CardError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe error: " + str(e),
        )


@payment_router.post("/subscribe")
async def subscribe_plans(data: SubscribePlans, user: User = Depends(get_current_user)):
    try:
        # Retrieve customer details
        customer_id = user.customer_id
        if not customer_id:
            customer_id = await generate_customer_id(user.email)

        customer = stripe.Customer.retrieve(customer_id)
        # Get the default payment method ID
        default_payment_method_id = customer.invoice_settings.default_payment_method

        if not default_payment_method_id:
            return {
                "success": False,
                "status": "card_required",
                "message": "Please enter payment info.",
            }

        # Check existing subscriptions
        existing_subscriptions = stripe.Subscription.list(
            customer=customer_id, status="active"
        )
        active_subscription_products = [
            item["plan"]["product"]
            for subscription in existing_subscriptions.data
            for item in subscription["items"]["data"]
        ]

        plans = []
        roles = user.roles if user.roles else []
        total_subscription_amount = 0  # To calculate total amount

        for product_id in data.products:
            # Check if the product is already subscribed
            if product_id in active_subscription_products:
                return {
                    "success": False,
                    "status": "already_subscribed",
                    "message": f"The product {product_id} is already subscribed.",
                }

            # Retrieve the price for the product
            prices = stripe.Price.list(
                product=product_id, active=True, expand=["data.product"]
            )
            for price in prices.data:
                if price.recurring["interval"] == data.interval:
                    plans.append(price.get("id"))
                    total_subscription_amount += price.unit_amount / 100  # Stripe uses cents

        # Create subscription with multiple plans
        subscription = stripe.Subscription.create(
            customer=customer_id,
            items=[{"price": plan} for plan in plans],
            default_payment_method=None,  # Defaults to the customer's default payment method
            expand=["latest_invoice.payment_intent"],  # Include payment intent for status
        )

        if subscription.status == "incomplete":
            return {
                "success": False,
                "status": subscription.status,
                "message": "Payment pending. Please complete the payment.",
            }
        elif subscription.status == "active":
            if data.affiliate:
                try:
                    affiliate_id = ObjectId(data.affiliate)
                except Exception:
                    raise HTTPException(
                        status_code=400, detail="Invalid affiliate ID format."
                    )

                # Ensure affiliate exists
                affiliate = await db.engine.find_one(User, (User.id == affiliate_id))
                if affiliate:
                    # Prevent self-referral commission
                    if user.id == affiliate_id:
                        return  # Simply exit without processing commission

                    # Fetch all subscriptions for the affiliate
                    all_subscriptions = stripe.Subscription.list(
                        customer=affiliate.customer_id
                    )


                    # Find the oldest subscription
                    oldest_subscription = min(
                        all_subscriptions.data, key=lambda sub: sub.created, default=None
                    )

                    if oldest_subscription:
                        subscription_created_at = datetime.utcfromtimestamp(oldest_subscription.created)
                        if subscription_created_at <= datetime.utcnow() - timedelta(days=15):
                            # Calculate affiliate commission
                            affiliate_commission = total_subscription_amount * 0.10
                            
                            # Save affiliate transaction
                            affiliateTrans = AffliliateTransactions(
                                user_id=user.id,
                                affiliate_id=affiliate_id,
                                subscription_id=subscription.id,
                                amount=affiliate_commission,
                                created_at=datetime.utcnow(),
                                is_processed=False
                            )
                            
                            affiliate.balance += affiliate_commission
                            await db.engine.save(affiliateTrans)
                            await db.engine.save(affiliate)

            return {
                "success": True,
                "status": subscription.status,
                "message": "Subscription active!",
            }
        elif subscription.status == "past_due":
            return {
                "success": False,
                "status": subscription.status,
                "message": "Payment failed. Please update your payment method.",
            }
        elif subscription.status == "canceled":
            return {
                "success": False,
                "status": subscription.status,
                "message": "Subscription canceled. Contact support if this is unexpected.",
            }
        else:
            return {
                "success": False,
                "status": subscription.status,
                "message": f"Subscription status: {subscription.status}",
            }

    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
    except Exception as e:
        raise e


@payment_router.get("/fetch-subscribed-plans")
async def fetch_subscribed_plans(user: User = Depends(get_current_user)):
    try:
        # Fetch subscriptions for the customer
        subscriptions = stripe.Subscription.list(customer=user.customer_id)

        # Extract subscribed plans
        subscribed_plans = []
        for subscription in subscriptions.data:
            for item in subscription["items"]["data"]:
                print("subscriptionid", subscription["id"])
                subscribed_plans.append(
                    {
                        "subscription_id": subscription["id"],  # Add subscription ID
                        "plan_id": item["plan"]["product"],
                        "plan_name": item["plan"]["nickname"],
                        "amount": item["plan"]["amount"],
                        "currency": item["plan"]["currency"],
                        "interval": item["plan"]["interval"],
                        "status": subscription["status"],
                    }
                )

        if not subscribed_plans:
            return {"message": "No subscribed plans found for the customer."}

        return {"subscribed_plans": subscribed_plans}

    except stripe.error.StripeError as e:
        # Handle Stripe-specific errors
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Handle generic errors
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")


@payment_router.post("/create-payment-intent")
async def create_payment_intent(data: CreatePaymentIntentRequest):
    try:
        payment_intent = stripe.PaymentIntent.create(
            amount=data.amount,
            currency=data.currency,
        )
        return {"clientSecret": payment_intent["client_secret"]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@payment_router.post("/unsubscribe")
async def unsubscribe_subscription(
    data: UnSubscribeRequest, user: User = Depends(get_current_user)
):
    """
    Unsubscribe a user from a Stripe subscription with refund conditions.
    """
    try:
        # Retrieve the subscription
        subscription = stripe.Subscription.retrieve(data.subscription_id)

        # Check if the subscription belongs to the current user
        if subscription.customer != user.customer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Subscription does not belong to the current user.",
            )

        # Get subscription creation date
        subscription_created_at = datetime.utcfromtimestamp(subscription.created)

        # Check if the user has had any previous subscriptions
        user_subscriptions = stripe.Subscription.list(customer=user.customer_id, status="canceled")

        # Condition: First subscription & canceled within 14 days
        is_first_subscription = len(user_subscriptions.data) == 0
        is_within_refund_period = datetime.utcnow() - subscription_created_at <= timedelta(days=14)

        refund_issued = False
        if is_first_subscription and  is_within_refund_period:
            # Issue a refund
            latest_invoice = stripe.Invoice.retrieve(subscription.latest_invoice)
            if latest_invoice.charge:
                stripe.Refund.create(charge=latest_invoice.charge)
                refund_issued = True

        # Cancel the subscription
        canceled_subscription = stripe.Subscription.delete(data.subscription_id)

        # Delete affiliate transactions related to the subscription
        affiliate_transactions = await db.engine.find(
            AffliliateTransactions, AffliliateTransactions.subscription_id == data.subscription_id
        )

        if affiliate_transactions:
            await db.engine.delete(AffliliateTransactions, AffliliateTransactions.subscription_id == data.subscription_id)

        return {
            "success": True,
            "message": f"Subscription {data.subscription_id} has been canceled successfully.",
            "status": canceled_subscription.status,
            "refund": refund_issued,
            "refund_message": "Refund issued." if refund_issued else "No refund applicable.",
        }

    except StripeError as e:
        print(f"Stripe error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Stripe error: {e}",
        )
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while canceling the subscription.",
        )
