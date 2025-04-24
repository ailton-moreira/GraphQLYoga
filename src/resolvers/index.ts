import Query from "./Query";
import Mutation from "./Mutation";
import Subscription from "./Subscription";
import Author from "./Author";
import Post from "./Post";
import Comment from "./Comment";
import Book from "./Book";
import Review from "./Review";
import User from "./User";
import File from "./File";

const resolvers: any = {
  /** Definig Query */
  Query,
  /** Definig Mutation */
  Mutation,
  /** Defining Subscrition */
  Subscription,
  /** Definig relationship */
  Post,
  User,
  Comment,
  Author,
  Book,
  Review,
  File,
};

export default resolvers;
