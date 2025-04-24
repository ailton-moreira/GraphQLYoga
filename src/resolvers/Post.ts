import { PrismaClient } from "@prisma/client";

interface Context {
  prisma: PrismaClient;
}

interface Post {
  id: string;
  authorId: string;
  published: boolean;
}

const Post = {
  author: async (parent: Post, _args: any, { prisma }: Context, info: any) => {
    return await prisma.user.findFirst({
      where: {
        id: parent.authorId,
      },
    });
  },

  comments: async (
    parent: Post,
    _args: any,
    { prisma }: Context,
    info: any
  ) => {
    return await prisma.comment.findMany({
      where: {
        postId: parent.id,
      },
    });
  },
};

export default Post;
