"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/utils/config";
import { CheckCircle2 } from "lucide-react";
// Import the check icon from Heroicons

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false); // New state to track if the email was sent
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message. Please try again.");
      }

      const data = await response.json();

      setEmailSent(true); // Set email sent state to true
      setEmail(""); // Reset the email input

      toast({
        title: "Successful",
        description: "Password Reset Email sent to your mail address.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Failed",
        description: "The email you provided is invalid.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>Forgot Password</CardTitle>
            </CardHeader>
            <CardContent>
              {emailSent ? (
                <div className="flex flex-col items-center space-y-4">
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                  <p className="text-center text-lg font-semibold text-green-700">
                    We’ve sent you an email with password reset instructions.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-black text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Email"}
                  </Button>
                </form>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/auth/register" className="w-full text-left">
                Create an account
              </Link>
              <Link href="/auth/login" className="w-full text-right">
                Login
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
