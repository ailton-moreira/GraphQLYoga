import { PrismaClient } from "@prisma/client";

interface Context {
  prisma: PrismaClient;
}

interface User {
  id: string;
}

const User = {
  posts: async (parent: User, _args: any, { prisma }: Context, info: any) => {
    return await prisma.post.findMany({
      where: {
        authorId: parent.id,
      },
    });
  },

  comments: async (
    parent: User,
    _args: any,
    { prisma }: Context,
    info: any
  ) => {
    return await prisma.comment.findMany({
      where: {
        authorId: parent.id,
      },
    });
  },

  books: async (parent: User, _args: any, { prisma }: Context, info: any) => {
    return await prisma.book.findMany({
      where: {
        authorId: parent.id,
      },
    });
  },

  reviews: async (parent: User, _args: any, { prisma }: Context, info: any) => {
    return await prisma.review.findMany({
      where: {
        userId: parent.id,
      },
    });
  },

  files: async (parent: User, _args: any, { prisma }: Context, info: any) => {
    return await prisma.file.findMany({
      where: {
        userId: parent.id,
      },
    });
  },
};

export default User;
