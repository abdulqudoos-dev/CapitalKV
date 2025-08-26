"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // for Next.js 13 app router
// If using pages router: import { useRouter } from "next/router";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  Code,
  Copy,
  Check,
} from "lucide-react";

import { gettingStarted } from "./gettingStarted/page";
import { apiReference } from "./apiReference/page";
import { support } from "./support/page";
import { featuresOverview } from "./featuresOverview/page";

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState("getting-started");
  const router = useRouter();

  const documentationSections = [
    gettingStarted,
    apiReference,
    support,
    featuresOverview,
  ];

  const renderCodeBlock = (code: string) => (
    <pre className="bg-black p-4 rounded-md text-sm overflow-x-auto whitespace-pre-wrap">
      <code>{code}</code>
    </pre>
  );

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        setActiveSection(hash);
      } else {
        setActiveSection("getting-started");
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 my-20">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push("/dashboard/home")}>
          ← Back to Home
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-1/4 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BookOpen className="text-primary" />
                <CardTitle>Documentation</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <nav className="space-y-2">
                {documentationSections.map((section) => (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection(section.id)}
                  >
                    <section.icon className="mr-2" size={16} /> {section.title}
                  </Button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Documentation Content */}
        <div className="w-full md:w-3/4">
          {documentationSections.map((section) => {
            if (section.id === "features-overview") {
              if (activeSection !== "features-overview") return null;

              return (
                <Card key={section.id}>
                  <CardHeader>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>
                      Explore the powerful features of the CapitalKV platform.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {section.features.map((feature, index) => (
                        <Card
                          key={index}
                          className="hover:shadow-lg transition-all duration-300"
                        >
                          <CardHeader>
                            <div className="flex items-center space-x-2">
                              <div className="p-2 rounded-full bg-primary/10">
                                <feature.icon
                                  size={24}
                                  className="text-primary"
                                />
                              </div>
                              <CardTitle className="text-lg">
                                {feature.title}
                              </CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground mb-4">
                              {feature.description}
                            </p>
                            <ul className="space-y-2">
                              {feature.benefits.map((benefit, i) => (
                                <li
                                  key={i}
                                  className="flex items-center space-x-2"
                                >
                                  <Check size={16} className="text-primary" />
                                  <span className="text-sm">{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            } else {
              if (activeSection !== section.id) return null;

              return (
                <Card key={section.id}>
                  <CardHeader>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>
                      Comprehensive guide to {section.title.toLowerCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible>
                      {section.content.map((item, idx) => (
                        <AccordionItem key={idx} value={`item-${idx}`}>
                          <AccordionTrigger>
                            <div className="flex items-center space-x-2">
                              <Code className="text-primary" size={16} />
                              <span>{item.subtitle}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="mb-4">{item.description}</p>
                            <div className="relative">
                              {renderCodeBlock(item.code)}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2"
                                aria-label="Copy code"
                                onClick={() => {
                                  navigator.clipboard.writeText(item.code);
                                }}
                              >
                                <Copy size={16} />
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
}
