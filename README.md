# GraphQL Yoga API

A modern GraphQL API built with GraphQL Yoga, Prisma, and TypeScript, featuring real-time subscriptions and authentication.

## Features

- 🚀 GraphQL Yoga server with TypeScript support
- 🔐 JWT-based authentication
- 📦 Prisma ORM for database operations
- 🔄 Real-time subscriptions
- 📝 CRUD operations for Posts, Books, Reviews, and Comments
- 👤 User management and authentication
- 🛡️ Type-safe resolvers and schemas
- 📊 Built-in pagination support

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn package manager

## Installation

1. Clone the repository:

```bash
git clone https://github.com/ailton-moreira/GraphQLYoga.git
cd GraphQLYoga
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
JWT_SECRET="your-secret-key"
```

4. Run Prisma migrations:

```bash
npx prisma migrate dev
```

## Running the Server

Development mode:

```bash
npm run dev
# or
yarn dev
```

The server will start at `http://localhost:4000/graphql`

## API Documentation

### Authentication

All authenticated requests require a JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Pagination

The API supports both offset-based and cursor-based pagination for all list queries. The pagination input accepts the following parameters:

```graphql
input PaginationInput {
  skip: Int # Number of items to skip (for offset-based pagination)
  take: Int # Number of items to return (default: 10)
  cursor: ID # Cursor for cursor-based pagination
}
```

All paginated queries return a connection type with the following structure:

```graphql
type Connection {
  data: [Edge!]! # Array of edges containing the actual data
  pageInfo: PageInfo! # Pagination metadata
  totalCount: Int! # Total number of items
}

type Edge {
  node: Type! # The actual data item
  cursor: ID! # Cursor for this item
}

type PageInfo {
  hasNextPage: Boolean! # Whether there are more items
  hasPreviousPage: Boolean! # Whether there are previous items
  startCursor: ID # Cursor for the first item
  endCursor: ID # Cursor for the last item
}
```

#### Example Queries

1. Basic pagination with skip and take:

```graphql
query {
  posts(pagination: { skip: 0, take: 10 }) {
    data {
      node {
        id
        title
        content
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
```

2. Cursor-based pagination:

```graphql
query {
  posts(pagination: { cursor: "last-cursor-id", take: 10 }) {
    data {
      node {
        id
        title
        content
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
```

### Available Operations

#### Queries

- `posts`: Get all posts (paginated)
- `books`: Get all books (paginated)
- `reviews`: Get all reviews (paginated)
- `comments`: Get all comments (paginated)
- `users`: Get all users (paginated)

#### Mutations

- `createPost`: Create a new post
- `updatePost`: Update an existing post
- `deletePost`: Delete a post
- `createBook`: Create a new book
- `updateBook`: Update an existing book
- `deleteBook`: Delete a book
- `createReview`: Create a new review
- `updateReview`: Update an existing review
- `deleteReview`: Delete a review
- `createComment`: Create a new comment
- `updateComment`: Update an existing comment
- `deleteComment`: Delete a comment
- `createUser`: Create a new user
- `login`: User login

#### Subscriptions

- Real-time updates for all entities (posts, books, reviews, comments)

## Example Usage

### Using Fetch

```javascript
// Query example with pagination
const response = await fetch("http://localhost:4000/graphql", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    query: `
      query {
        posts(pagination: { skip: 0, take: 10 }) {
          data {
            node {
              id
              title
              content
            }
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
          totalCount
        }
      }
    `,
  }),
});

// Mutation example
const createPost = await fetch("http://localhost:4000/graphql", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    query: `
      mutation {
        createPost(data: {
          title: "New Post",
          content: "Post content",
          published: true
        }) {
          id
          title
        }
      }
    `,
  }),
});
```

### Using Apollo Client

```javascript
import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  cache: new InMemoryCache(),
  headers: {
    authorization: `Bearer ${token}`,
  },
});

// Query example with pagination
const { data } = await client.query({
  query: gql`
    query {
      posts(pagination: { skip: 0, take: 10 }) {
        data {
          node {
            id
            title
            content
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
        totalCount
      }
    }
  `,
});

// Mutation example
const { data } = await client.mutate({
  mutation: gql`
    mutation {
      createPost(
        data: { title: "New Post", content: "Post content", published: true }
      ) {
        id
        title
      }
    }
  `,
});
```

### Using Subscriptions

```javascript
import { ApolloClient, InMemoryCache, split, HttpLink } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:4000/graphql",
  })
);

const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

// Subscribe to post updates
const subscription = client.subscribe({
  query: gql`
    subscription {
      post {
        mutation
        node {
          id
          title
          content
        }
      }
    }
  `,
});

subscription.subscribe({
  next: (data) => {
    console.log("New post update:", data);
  },
});
```

## Data Models

### Post

```graphql
type Post {
  id: String!
  title: String!
  content: String!
  published: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
  author: User!
  comments: [Comment!]!
}
```

### Book

```graphql
type Book {
  id: String!
  title: String!
  description: String
  published: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
  author: User!
  reviews: [Review!]!
}
```

### Review

```graphql
type Review {
  id: String!
  rating: Int!
  comment: String
  published: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
  book: Book!
  user: User!
}
```

### Comment

```graphql
type Comment {
  id: String!
  content: String!
  published: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
  post: Post!
  author: User!
}
```

### User

```graphql
type User {
  id: String!
  name: String!
  email: String!
  password: String!
  createdAt: DateTime!
  updatedAt: DateTime!
  posts: [Post!]!
  comments: [Comment!]!
  reviews: [Review!]!
  books: [Book!]!
}
```

## Error Handling

The API returns standard GraphQL errors with appropriate status codes and messages. Common error scenarios include:

- Authentication errors (401)
- Authorization errors (403)
- Validation errors (400)
- Not found errors (404)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
