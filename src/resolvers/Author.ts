import { PrismaClient } from "@prisma/client";

interface Context {
  prisma: PrismaClient;
}

interface Author {
  id: string;
}

const Author = {
  books: async (parent: Author, _args: any, { prisma }: Context) => {
    return await prisma.book.findMany({
      where: {
        authorId: parent.id,
      },
    });
  },
  posts: async (parent: Author, _args: any, { prisma }: Context) => {
    return await prisma.post.findMany({
      where: {
        authorId: parent.id,
      },
    });
  },
  comments: async (parent: Author, _args: any, { prisma }: Context) => {
    return await prisma.comment.findMany({
      where: {
        authorId: parent.id,
      },
    });
  },
};

export default Author;
