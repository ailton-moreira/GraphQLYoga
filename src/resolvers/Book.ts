import { PrismaClient } from "@prisma/client";

interface Context {
  prisma: PrismaClient;
}

interface Book {
  id: string;
  authorId: string;
  published: boolean;
}

const Book = {
  author: async (parent: Book, _args: any, { prisma }: Context, info: any) => {
    return await prisma.user.findFirst({
      where: {
        id: parent.authorId,
      },
    });
  },

  reviews: async (parent: Book, _args: any, { prisma }: Context, info: any) => {
    return await prisma.review.findMany({
      where: {
        bookId: parent.id,
      },
    });
  },
};

export default Book;
