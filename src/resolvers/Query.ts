import { Context } from "../types/context";
import { getUserId } from "../utils/auth";
import { paginate } from "../utils/pagination";

const Query = {
  // User queries
  me: async (_parent: any, _args: any, context: Context, info: any) => {
    const userId = getUserId(context.request, true);
    return await context.prisma.user.findUnique({
      where: { id: userId.toString() },
    });
  },

  users: async (
    _parent: any,
    { pagination }: { pagination?: any },
    { prisma }: Context,
    info: any
  ) => {
    return await prisma.user.findMany({
      skip: pagination?.skip,
      take: pagination?.take,
      cursor: pagination?.cursor ? { id: pagination.cursor } : undefined,
    });
  },

  user: async (
    _parent: any,
    { id }: { id: string },
    { prisma }: Context,
    info: any
  ) => {
    return await prisma.user.findUnique({
      where: { id: id },
    });
  },

  // Post queries
  posts: async (
    _parent: any,
    { pagination }: { pagination?: any },
    { prisma }: Context,
    info: any
  ) => {
    return await paginate(prisma, "post", pagination, {
      published: true,
    });
  },

  post: async (
    _parent: any,
    { id }: { id: string },
    { prisma }: Context,
    info: any
  ) => {
    return await prisma.post.findUnique({
      where: { id: id },
      include: {
        author: true,
        comments: true,
      },
    });
  },

  myPosts: async (
    _parent: any,
    { pagination }: { pagination?: any },
    context: Context,
    info: any
  ) => {
    const userId = getUserId(context.request, true);
    return await paginate(context.prisma, "post", pagination, {
      authorId: userId,
    });
  },

  // Book queries
  books: async (
    _parent: any,
    { pagination }: { pagination?: any },
    { prisma }: Context,
    info: any
  ) => {
    return await paginate(prisma, "book", pagination, {
      published: true,
    });
  },

  book: async (
    _parent: any,
    { id }: { id: string },
    { prisma }: Context,
    info: any
  ) => {
    return await prisma.book.findUnique({
      where: { id: id },
      include: {
        author: true,
        reviews: true,
      },
    });
  },

  // Comment queries
  comments: async (
    _parent: any,
    { pagination }: { pagination?: any },
    { prisma }: Context,
    info: any
  ) => {
    return await paginate(prisma, "comment", pagination, {
      published: true,
    });
  },

  // Review queries
  reviews: async (
    _parent: any,
    { pagination }: { pagination?: any },
    { prisma }: Context,
    info: any
  ) => {
    return await paginate(prisma, "review", pagination, {
      published: true,
    });
  },

  // Search functionality
  search: async (
    _parent: any,
    { query }: { query: string },
    { prisma }: Context,
    info: any
  ) => {
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
        ],
      },
    });

    const books = await prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
    });

    return [...posts, ...books];
  },
};

export default Query;
