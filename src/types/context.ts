import {
  PrismaClient,
  Book,
  Comment,
  Post,
  Review,
  User,
} from "@prisma/client";
import { Request } from "express";
import { createPubSub } from "@graphql-yoga/subscription";

import { SubscriptionType } from "./subscriptionTypes";
// 1
export type PubSubChannels = {
  [SubscriptionType.COUNT]: [{ count: number }];
  [SubscriptionType.BOOK]: [{ book: { mutation: string; node: Book } }];
  [SubscriptionType.COMMENT]: [
    { comment: { mutation: string; node: Comment } }
  ];
  [SubscriptionType.POST]: [{ post: { mutation: string; node: Post } }];
  [SubscriptionType.REVIEW]: [{ review: { mutation: string; node: Review } }];
  [SubscriptionType.USER]: [{ user: { mutation: string; node: User } }];
};

// 2
const pubSub = createPubSub<PubSubChannels>();

export interface Context {
  prisma: PrismaClient;
  request: Request;
  userId?: string;
  pubsub: typeof pubSub;
}

export interface UserContext extends Context {
  userId: string;
}

export interface PostContext extends Context {
  userId: string;
}

export interface CommentContext extends Context {
  userId: string;
}

export interface BookContext extends Context {
  userId: string;
}

export interface ReviewContext extends Context {
  userId: string;
}

export interface AuthorContext extends Context {
  userId: string;
}
