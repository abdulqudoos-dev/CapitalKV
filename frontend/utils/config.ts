import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";

export const API_URL: string =
  process.env.NEXT_PUBLIC_BE_API_BASE_URL ||
  "http://127.0.0.1:8000";

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);
