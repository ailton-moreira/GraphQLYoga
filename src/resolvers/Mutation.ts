import { Context } from "../types/context";
import { getUserId } from "../utils/auth";
import { generateToken } from "../utils/auth";
import bcrypt from "bcryptjs";
import { MutationType, SubscriptionType } from "../types/subscriptionTypes";
import { GraphQLError } from "graphql";
import { createWriteStream } from "fs";
import { join } from "path";
import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";

interface UserCreateInput {
  email: string;
  password: string;
  name: string;
}

interface UserLoginInput {
  email: string;
  password: string;
}

interface PostCreateInput {
  title: string;
  content: string;
  published: boolean;
}

interface BookCreateInput {
  title: string;
  description: string;
  published: boolean;
}

interface CommentCreateInput {
  content: string;
  postId: string;
  published: boolean;
}

interface ReviewCreateInput {
  comment: string;
  rating: number;
  bookId: string;
  published: boolean;
}

interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => NodeJS.ReadableStream;
}

const Mutation = {
  // User mutations
  createUser: async (
    _parent: any,
    { data }: { data: UserCreateInput },
    { prisma, pubsub }: Context
  ) => {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    //subscription
    pubsub.publish(SubscriptionType.USER, {
      user: {
        mutation: MutationType.CREATED,
        node: user,
      },
    });
    return {
      user,
      token: generateToken(user.id.toString()),
    };
  },

  deleteUser: async (
    _parent: any,
    { id }: { id: string },
    { prisma, pubsub }: Context
  ) => {
    const userToDelete = await prisma.user.findUnique({ where: { id: id } });

    if (userToDelete) {
      pubsub.publish(SubscriptionType.USER, {
        user: {
          mutation: MutationType.DELETED,
          node: userToDelete,
        },
      });
    }
    return await prisma.user.delete({ where: { id: id } });
  },

  updateUser: async (
    _parent: any,
    { id, data }: { id: string; data: Partial<UserCreateInput> },
    { prisma, pubsub }: Context
  ) => {
    const user = await prisma.user.update({ where: { id: id }, data });
    if (!user) {
      throw new GraphQLError("User not found");
    }
    //subscription
    pubsub.publish(SubscriptionType.USER, {
      user: {
        mutation: MutationType.UPDATED,
        node: user,
      },
    });
    return { user };
  },

  // AUTH
  login: async (
    _parent: any,
    { data }: { data: UserLoginInput },
    { prisma }: Context
  ) => {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new GraphQLError("Invalid credentials");
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      throw new GraphQLError("Invalid credentials");
    }

    return {
      user,
      token: generateToken(user.id.toString()),
    };
  },

  // Post mutations
  createPost: async (
    _parent: any,
    { data }: { data: PostCreateInput },
    { prisma, pubsub, request }: Context
  ) => {
    const userId = getUserId(request, true);
    const post = await prisma.post.create({
      data: {
        ...data,
        authorId: userId,
      },
    });

    if (post.published) {
      //subscription
      pubsub.publish(SubscriptionType.POST, {
        post: {
          mutation: MutationType.CREATED,
          node: post,
        },
      });
    }
    return post;
  },

  updatePost: async (
    _parent: any,
    { id, data }: { id: string; data: Partial<PostCreateInput> },
    { prisma, pubsub, request }: Context
  ) => {
    const userId = getUserId(request, true);
    const post = await prisma.post.findUnique({
      where: { id: id },
    });

    if (!post || post.authorId !== userId) {
      throw new GraphQLError("Post not found or access denied");
    }

    const updatedPost = await prisma.post.update({
      where: { id: id },
      data,
    });

    //subscription
    if (updatedPost.published) {
      pubsub.publish(SubscriptionType.POST, {
        post: {
          mutation: MutationType.UPDATED,
          node: updatedPost,
        },
      });
    }
    return updatedPost;
  },

  deletePost: async (
    _parent: any,
    { id }: { id: string },
    { prisma, pubsub, request }: Context
  ) => {
    const userId = getUserId(request, true);
    const post = await prisma.post.findUnique({
      where: { id: id },
    });

    if (!post || post.authorId !== userId) {
      throw new GraphQLError("Post not found or access denied");
    }

    const deletedPost = await prisma.post.delete({
      where: { id: id },
    });

    if (!deletedPost) {
      throw new GraphQLError("Post not found");
    }

    //subscription
    pubsub.publish(SubscriptionType.POST, {
      post: {
        mutation: MutationType.DELETED,
        node: deletedPost,
      },
    });
    return deletedPost;
  },

  // Book mutations
  createBook: async (
    _parent: any,
    { data }: { data: BookCreateInput },
    { prisma, pubsub, request }: Context
  ) => {
    const userId = getUserId(request, true);
    const book = await prisma.book.create({
      data: {
        ...data,
        authorId: userId,
      },
    });
    if (!book) {
      throw new GraphQLError("Book not created");
    }

    if (book.published) {
      //subscription
      pubsub.publish(SubscriptionType.BOOK, {
        book: {
          mutation: MutationType.CREATED,
          node: book,
        },
      });
    }
    return book;
  },

  updateBook: async (
    _parent: any,
    { id, data }: { id: string; data: Partial<BookCreateInput> },
    { prisma, pubsub, request }: Context
  ) => {
    const userId = getUserId(request, true);
    const book = await prisma.book.findUnique({
      where: { id: id },
    });

    if (!book || book.authorId !== userId) {
      throw new GraphQLError("Book not found or access denied");
    }

    const updatedBook = await prisma.book.update({
      where: { id: id },
      data,
    });

    if (!updatedBook) {
      throw new GraphQLError("Book not found");
    }
    if (updatedBook.published) {
      //subscription
      pubsub.publish(SubscriptionType.BOOK, {
        book: {
          mutation: MutationType.UPDATED,
          node: updatedBook,
        },
      });
    }
    return updatedBook;
  },

  deleteBook: async (
    _parent: any,
    { id }: { id: string },
    { prisma, pubsub, request }: Context
  ) => {
    const userId = getUserId(request, true);
    const book = await prisma.book.findUnique({
      where: { id: id },
    });

    if (!book || book.authorId !== userId) {
      throw new GraphQLError("Book not found or access denied");
    }

    const deletedBook = await prisma.book.delete({
      where: { id: id },
    });
    if (!deletedBook) {
      throw new GraphQLError("Book not found");
    }
    //subscription
    pubsub.publish(SubscriptionType.BOOK, {
      book: {
        mutation: MutationType.DELETED,
        node: deletedBook,
      },
    });
    return deletedBook;
  },

  // Comment mutations
  createComment: async (
    _parent: any,
    { data }: { data: CommentCreateInput },
    { pubsub, prisma, request }: Context
  ) => {
    const userId = getUserId(request, true);
    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        post: { connect: { id: data.postId } },
        author: { connect: { id: userId } },
        published: data.published,
      },
    });
    if (!comment) {
      throw new GraphQLError("Comment not created");
    }
    if (comment.published) {
      //pubsub
      pubsub.publish(SubscriptionType.COMMENT, {
        comment: {
          mutation: MutationType.CREATED,
          node: comment,
        },
      });
    }
    return comment;
  },

  updateComment: async (
    _parent: any,
    { id, data }: { id: string; data: Partial<CommentCreateInput> },
    { prisma, pubsub, request }: Context
  ) => {
    const userId = getUserId(request, true);
    const comment = await prisma.comment.findUnique({
      where: { id: id },
    });

    if (!comment || comment.authorId !== userId) {
      throw new GraphQLError("Comment not found or access denied");
    }

    const updatedComment = await prisma.comment.update({
      where: { id: id },
      data,
    });

    if (updatedComment.published) {
      //subupdatedCommentscription
      pubsub.publish(SubscriptionType.COMMENT, {
        comment: {
          mutation: MutationType.UPDATED,
          node: updatedComment,
        },
      });
    }
    return updatedComment;
  },

  deleteComment: async (
    _parent: any,
    { id }: { id: string },
    { prisma, pubsub, request }: Context
  ) => {
    const userId = getUserId(request, true);
    const comment = await prisma.comment.findUnique({
      where: { id: id },
    });

    if (!comment || comment.authorId !== userId) {
      throw new GraphQLError("Comment not found or access denied");
    }

    const deletedComment = await prisma.comment.delete({
      where: { id: id },
    });
    if (!deletedComment) {
      throw new GraphQLError("Comment not found");
    }

    //subscription
    pubsub.publish(SubscriptionType.COMMENT, {
      comment: {
        mutation: MutationType.DELETED,
        node: deletedComment,
      },
    });
    return deletedComment;
  },

  // Review mutations
  createReview: async (
    _parent: any,
    { data }: { data: ReviewCreateInput },
    { prisma, pubsub, request }: Context
  ) => {
    const userId = getUserId(request, true);
    const review = await prisma.review.create({
      data: {
        comment: data.comment,
        rating: data.rating,
        book: { connect: { id: data.bookId } },
        user: { connect: { id: userId } },
        published: data.published,
      },
    });
    if (review.published) {
      //pubsub
      pubsub.publish(SubscriptionType.REVIEW, {
        review: {
          mutation: MutationType.CREATED,
          node: review,
        },
      });
    }
    return review;
  },

  updateReview: async (
    _parent: any,
    { id, data }: { id: string; data: Partial<ReviewCreateInput> },
    { prisma, pubsub, request }: Context
  ) => {
    const userId = getUserId(request, true);
    const review = await prisma.review.findUnique({
      where: { id: id },
    });

    if (!review || review.userId !== userId) {
      throw new GraphQLError("Review not found or access denied");
    }

    const updatedReview = await prisma.review.update({
      where: { id: id },
      data: {
        ...data,
        comment: data.comment,
        rating: data.rating,
      },
    });
    if (!updatedReview) {
      throw new GraphQLError("Review not found");
    }
    if (updatedReview.published) {
      //subscription
      pubsub.publish(SubscriptionType.REVIEW, {
        review: {
          mutation: MutationType.UPDATED,
          node: updatedReview,
        },
      });
    }
    return updatedReview;
  },

  deleteReview: async (
    _parent: any,
    { id }: { id: string },
    { prisma, pubsub, request }: Context
  ) => {
    const userId = getUserId(request, true);
    const review = await prisma.review.findUnique({
      where: { id: id },
    });

    if (!review || review.userId !== userId) {
      throw new GraphQLError("Review not found or access denied");
    }

    const deletedReview = await prisma.review.delete({
      where: { id: id },
    });
    if (!deletedReview) {
      throw new GraphQLError("Review not found");
    }
    //subscription
    pubsub.publish(SubscriptionType.REVIEW, {
      review: {
        mutation: MutationType.DELETED,
        node: deletedReview,
      },
    });
    return deletedReview;
  },

  // File upload mutations
  uploadFile: async (
    _parent: any,
    { file }: { file: FileUpload },
    { prisma, request }: Context
  ) => {
    const userId = getUserId(request, false);

    // Extract file from form-data
    const { createReadStream, filename, mimetype, encoding } = await file;
    const uniqueFilename = `${uuidv4()}-${filename}`;
    const uploadDir = join(process.cwd(), "uploads");

    // Ensure uploads directory exists
    await fs.ensureDir(uploadDir);

    const path = join(uploadDir, uniqueFilename);
    const url = `/uploads/${uniqueFilename}`;
    try {
      const fileArrayBuffer = await file.arrayBuffer()
      await fs.promises.writeFile(
        path.join(__dirname, file.name),
        Buffer.from(fileArrayBuffer),
      )
    } catch (e) {
      return false
    }
    return true

/*     // Write file to the server
    return new Promise((resolve, reject) => {
      createReadStream()
        .pipe(createWriteStream(path))
        .on("finish", async () => {
          try {
            // Save file metadata to database
            const fileRecord = await prisma.file.create({
              data: {
                filename: uniqueFilename,
                mimetype,
                encoding,
                url,
                userId: userId || undefined,
              },
            });
            console.log("File uploaded successfully:", fileRecord);

            resolve(fileRecord);
          } catch (error) {
            // Clean up file if database operation fails
            fs.unlink(path).catch(console.error);
            reject(error);
          }
        })
        .on("error", (error) => {
          console.log("Error uploading file:", error);

          reject(error);
        });
    }); */
  },

  uploadMultipleFiles: async (
    _parent: any,
    { files }: { files: FileUpload[] },
    { prisma, request }: Context
  ) => {
    const userId = getUserId(request, false);
    const uploadDir = join(process.cwd(), "uploads");

    // Ensure uploads directory exists
    await fs.ensureDir(uploadDir);

    // Process each file
    const uploadPromises = files.map(async (file) => {
      // Don't await the file object itself
      const { createReadStream, filename, mimetype, encoding } = file;
      const uniqueFilename = `${uuidv4()}-${filename}`;
      const path = join(uploadDir, uniqueFilename);
      const url = `/uploads/${uniqueFilename}`;

      return new Promise((resolve, reject) => {
        createReadStream()
          .pipe(createWriteStream(path))
          .on("finish", async () => {
            try {
              // Save file metadata to database
              const fileRecord = await prisma.file.create({
                data: {
                  filename: uniqueFilename,
                  mimetype,
                  encoding,
                  url,
                  userId: userId || undefined,
                },
              });

              resolve(fileRecord);
            } catch (error) {
              // Clean up file if database operation fails
              fs.unlink(path).catch(console.error);
              reject(error);
            }
          })
          .on("error", (error) => {
            reject(error);
          });
      });
    });

    return Promise.all(uploadPromises);
  },

  deleteFile: async (
    _parent: any,
    { id }: { id: string },
    { prisma, request }: Context
  ) => {
    const userId = getUserId(request, true);

    // Find the file in the database
    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new GraphQLError("File not found");
    }

    // Check if the user owns the file (if it has an owner)
    if (file.userId && file.userId !== userId) {
      throw new GraphQLError("Not authorized to delete this file");
    }

    // Delete the physical file
    const filePath = join(process.cwd(), file.url.replace(/^\//, ""));

    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error("Failed to delete file from filesystem:", error);
    }

    // Remove the file record from the database
    return prisma.file.delete({
      where: { id },
    });
  },
};

export default Mutation;
