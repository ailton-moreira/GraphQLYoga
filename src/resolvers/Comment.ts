import { PrismaClient } from "@prisma/client";

interface Context {
  prisma: PrismaClient;
}

interface Comment {
  id: string;
  authorId: string;
  postId: string;
  published: boolean;
}

const Comment = {
  author: async (
    parent: Comment,
    _args: any,
    { prisma }: Context,
    info: any
  ) => {
    return await prisma.user.findFirst({
      where: { id: parent.authorId },
    });
  },

  post: async (parent: Comment, _args: any, { prisma }: Context, info: any) => {
    return await prisma.post.findFirst({
      where: { id: parent.postId },
    });
  },
};

export default Comment;
