import { createSchema, createYoga, createPubSub } from "graphql-yoga";
import { createServer } from "node:http";
import { PrismaClient } from "@prisma/client";
import { Context } from "./types/context";
import { join } from "path";
import express from "express";

import typeDefinitions from "./schema";
import resolvers from "./resolvers";
import { authMiddleware } from "./middleware/auth";

const prisma = new PrismaClient();

const pubsub = createPubSub();

const schema = createSchema<Context>({
  typeDefs: typeDefinitions,
  resolvers,
});

async function main() {
  // Create Express app to serve uploaded files
  const app = express();

  // Serve static files from the uploads directory
  app.use("/uploads", express.static(join(process.cwd(), "uploads")));

  // Serve the test HTML file
  app.use("/test", express.static(join(process.cwd(), "src/public")));

  const yoga = createYoga({
    schema,
    context: async ({ request }) => {
      const context = {
        prisma,
        request,
        pubsub,
      };
      return authMiddleware({
        ...context,
        request: context.request as any, // Type assertion to bypass type mismatch
      });
    },
    logging: true,
    maskedErrors: false, // This will show the actual error messages
  });

  // Use Express as the server
  app.use("/graphql", yoga);

  // Start the server
  app.listen(4000, () => {
    console.log("🚀 🚀 🚀 GraphQL Server Started on port 4000... 🚀 🚀 🚀 ");
    console.info("Server is running on http://localhost:4000/graphql");
    console.info(
      "Uploaded files are accessible at http://localhost:4000/uploads/"
    );
    console.info(
      "Test file upload at http://localhost:4000/test/upload-test.html"
    );
  });
}

main().catch((err) => {
  console.error("Error starting server:", err);
  process.exit(1);
});
