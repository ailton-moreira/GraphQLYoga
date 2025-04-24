import { getUserId } from "../utils/auth";
import { Context } from "../types/context";

export const authMiddleware = async (context: Context): Promise<Context> => {
  try {
    const userId = getUserId(context.request, false);
    return {
      ...context,
      userId,
    };
  } catch (error) {
    return context;
  }
};
