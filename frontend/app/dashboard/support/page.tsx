"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, Phone, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios"; // Import axios for HTTP requests
import Cookies from "js-cookie"; // Import Cookies for token management
import { API_URL } from "@/utils/config";

const SupportPage = () => {
  const [messages, setMessages] = useState({
    general: "",
    technical: "",
    billing: "",
    urgent: "",
  });
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const BASE_URL = API_URL;

  const apiEndpoints = {
    general: `${BASE_URL}/support/general/message`,
    technical: `${BASE_URL}/support/general/message`,
    billing: `${BASE_URL}/support/billing/message`,
    urgent: `${BASE_URL}/support/general/message`,
  };

  const handleInputChange = (category: string, value: string) => {
    setMessages((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleSubmit = async (category: string) => {
    const message = messages[category];
    const endpoint = apiEndpoints[category];

    if (!message) {
      alert("Message cannot be empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        endpoint,
        { message },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`, // Using Cookies to get token
          },
        }
      );

      if (!response.data) {
        toast({
          title: "Failed",
          description: `Error: ${
            response.data.error || "Something went wrong"
          }`,
        });
        return;
      }

      toast({
        title: "Message Sent!",
        description: `Message sent successfully!`,
      });
      // Clear input field after successful submission
      handleInputChange(category, "");
    } catch (error) {
      toast({
        title: "Failed",
        description: `Failed to send the message. Please try again later.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const supportCategories = [
    {
      title: "General Support",
      description: "Questions about the platforms services",
      icon: <MessageCircle className="w-6 h-6" />,
      category: "general",
    },
    {
      title: "Technical Support",
      description: "Issues with our platform or integration",
      icon: <Mail className="w-6 h-6" />,
      category: "technical",
    },
    {
      title: "Billing Support",
      description: "Questions about your subscription or payments",
      icon: <Phone className="w-6 h-6" />,
      category: "billing",
    },
    {
      title: "24/7 Urgent Support",
      description: "Critical issues requiring immediate attention",
      icon: <Clock className="w-6 h-6" />,
      category: "urgent",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">How Can We Help?</h1>
        <p className="text-lg text-gray-600">
          Our AI-powered support team is here to assist you 24/7
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {supportCategories.map(({ title, description, icon, category }) => (
          <Card key={category} className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-4">
                {icon}
                <CardTitle>{title}</CardTitle>
              </div>
              <p className="text-sm text-gray-500">{description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Type your message here..."
                  value={messages[category]}
                  onChange={(e) => handleInputChange(category, e.target.value)}
                  className="w-full"
                  disabled={isSubmitting}
                />
                <Button
                  onClick={() => handleSubmit(category)}
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SupportPage;
