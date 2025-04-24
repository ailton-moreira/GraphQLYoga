import { PrismaClient } from "@prisma/client";

interface Context {
  prisma: PrismaClient;
}

interface Review {
  id: string;
  userId: string;
  bookId: string;
  published: boolean;
}

const Review = {
  author: async (
    parent: Review,
    _args: any,
    { prisma }: Context,
    info: any
  ) => {
    console.log("parent.authorId", parent);

    const user = await prisma.user.findUnique({
      where: {
        id: parent.userId,
      },
    });

    if (!user) {
      throw new Error(`User with ID ${parent.userId} not found`);
    }

    return user;
  },

  book: async (parent: Review, _args: any, { prisma }: Context, info: any) => {
    return await prisma.book.findFirst({
      where: {
        id: parent.bookId,
      },
    });
  },
};

export default Review;
