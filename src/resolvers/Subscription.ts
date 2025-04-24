import { Context } from "../types/context";
import { getUserId } from "../utils/auth";
import { SubscriptionType } from "../types/subscriptionTypes";
import { GraphQLError } from "graphql";

const Subscription = {
  // Post subscription
  post: {
    subscribe: (_parent: any, _args: any, { pubsub, prisma }: Context) => {
      const post = prisma.post.findUnique({
        where: { id: _args.postId },
      });
      if (!post) {
        throw new GraphQLError("Post not found");
      }
      return pubsub.subscribe(SubscriptionType.POST);
    },
  },

  // Comment subscription
  comment: {
    subscribe: (
      _parent: any,
      { postId }: { postId: string },
      { pubsub, prisma }: Context
    ) => {
      const post = prisma.post.findUnique({
        where: { id: postId },
      });
      if (!post) {
        throw new GraphQLError("Post not found");
      }
      return pubsub.subscribe(SubscriptionType.COMMENT);
    },
  },

  // Book subscription
  book: {
    subscribe: (_parent: any, _args: any, { pubsub, prisma }: Context) => {
      return pubsub.subscribe(SubscriptionType.BOOK);
    },
  },

  // Review subscription
  review: {
    subscribe: async (
      _parent: any,
      { bookId }: { bookId: string },
      { pubsub, prisma }: Context
    ) => {
      const book = prisma.book.findUnique({
        where: { id: bookId },
      });
      if (!book) {
        throw new GraphQLError("Book not found");
      }
      return pubsub.subscribe(SubscriptionType.REVIEW);
    },
  },

  // User subscription
  user: {
    subscribe: (_parent: any, _args: any, context: Context) => {
      const userId = getUserId(context.request, true);
      return context.pubsub.subscribe(SubscriptionType.USER);
    },
  },
};

export default Subscription;
