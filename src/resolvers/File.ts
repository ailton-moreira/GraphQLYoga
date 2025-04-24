import { PrismaClient } from "@prisma/client";

interface Context {
  prisma: PrismaClient;
}
interface Author {
  userId: string;
}

const File = {
  user: async (parent: Author, _args: any, { prisma }: Context) => {
    if (!parent.userId) {
      return null;
    }
    return prisma.user.findUnique({
      where: {
        id: parent.userId,
      },
    });
  },
};

export default File;
