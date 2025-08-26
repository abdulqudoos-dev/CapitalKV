import { Code } from "lucide-react";

export const apiReference = {
  id: "api-reference",
  title: "API Reference",
  icon: Code,
  content: [
    {
      subtitle: "Authentication",
      description: "Secure authentication methods.",
      code: `// Generate API Token
const token = client.auth.generateToken({
  permissions: ['read', 'write'],
});`,
    },
    {
      subtitle: "Data Operations",
      description: "CRUD operations with CapitalKV resources.",
      code: `// Create a new resource
const newResource = await client.resources.create({
  type: 'financial',
  data: { ... },
});`,
    },
  ],
};
