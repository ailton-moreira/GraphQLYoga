export interface UserCreateInput {
  email: string;
  password: string;
  name: string;
}

export interface UserLoginInput {
  email: string;
  password: string;
}

export interface PostCreateInput {
  title: string;
  content: string;
  published: boolean;
}

export interface BookCreateInput {
  title: string;
  description: string;
  published: boolean;
}

export interface CommentCreateInput {
  content: string;
  postId: string;
  published: boolean;
}

export interface ReviewCreateInput {
  comment: string;
  rating: number;
  bookId: string;
  published: boolean;
}

export interface Review {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  comment: string | null;
  rating: number;
  bookId: string;
  published: boolean;
}

export interface Post {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  content: string;
  authorId: string;
  published: boolean;
}
