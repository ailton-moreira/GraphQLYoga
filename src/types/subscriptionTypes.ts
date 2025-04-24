export enum SubscriptionType {
  COUNT = "COUNT",
  POST = "POST",
  COMMENT = "COMMENT",
  BOOK = "BOOK",
  REVIEW = "REVIEW",
  USER = "USER",
}

export enum MutationType {
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  DELETED = "DELETED",
}

export const getCommentSubscriptionType = (
  postId: string,
  type: SubscriptionType
): string => {
  return `${type}_${postId}`;
};

export const getReviewSubscriptionType = (
  bookId: string,
  type: SubscriptionType
): string => {
  return `${type}_${bookId}`;
};

export const getUserSubscriptionType = (
  userId: string,
  type: SubscriptionType
): string => {
  return `${type}_${userId}`;
};
