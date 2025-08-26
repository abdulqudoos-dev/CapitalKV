import { BookOpen } from "lucide-react";

export const gettingStarted = {
  id: "getting-started",
  title: "Getting Started",
  icon: BookOpen,
  content: [
    {
      subtitle: "Installation",
      description: "How to install the CapitalKV client library.",
      code: `npm install capitalkv-client`,
    },
    {
      subtitle: "Configuration",
      description: "Setting up your CapitalKV client with API key and environment.",
      code: `const client = new CapitalKv({
  apiKey: 'YOUR_API_KEY',
  environment: 'production',
});`,
    },
  ],
};
