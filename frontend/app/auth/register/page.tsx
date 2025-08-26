"use client";

import { useState, useContext } from "react";
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
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import AuthContext from "@/contexts/AuthContext";
import Link from "next/link";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useContext(AuthContext);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log(userName)
    const result = await signup(userName, email, password);

    if (result.success) {
      toast({
        title: "Success!",
        description: "Your account has been created successfully.",
        variant: "default",
      });

      // Clear the form fields
      setUserName("");
      setEmail("");
      setPassword("");

      router.push("/dashboard/home");
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
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
              <CardTitle>Signup</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">User Name</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Your User Name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </div>
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
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter Your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
  <div className="flex items-start space-x-2">
  <input
    type="checkbox"
    id="terms-checkbox"
    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
    required
  />
  <label htmlFor="terms-checkbox" className="text-sm text-gray-700 leading-relaxed">
    By signing up, you agree to our <a href="/terms" className="text-blue-600 underline">Terms</a>, 
    <a href="/legal/privacy" className="text-blue-600 underline"> Privacy Policy</a>, and 
    <a href="/legal/cookie" className="text-blue-600 underline"> Cookie Use</a>. Capitalkv may use your contact 
    information, including your email address and phone number for purposes outlined in our 
    <a href="/legal/privacy" className="text-blue-600 underline"> Privacy Policy</a>. 
    <a href="legal" className="text-blue-600 underline"> Learn more</a>.
  </label>
</div>
                <Button
                  type="submit"
                  className="w-full bg-black text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing Up" : "Sign Up"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="justify-center">
              <Link href="/auth/login" className="w-full text-left">Already have an account?</Link>
              <Link href="/auth/forgot-password" className="w-full text-right">Forgot password</Link>         
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
