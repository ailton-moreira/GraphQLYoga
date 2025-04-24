import { PrismaClient } from "@prisma/client";

interface PaginationInput {
  skip?: number;
  take?: number;
  cursor?: string;
}

interface PaginationResult<T> {
  data: Array<{
    node: T;
    cursor: string;
  }>;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
  totalCount: number;
}

export async function paginate<T>(
  prisma: PrismaClient,
  model: string,
  pagination: PaginationInput = {},
  where: any = {},
  orderBy: any = { createdAt: "desc" }
): Promise<PaginationResult<T>> {
  const { skip = 0, take = 10, cursor } = pagination;

  // Get total count
  const totalCount = await (prisma as any)[model].count({ where });

  // Get the items
  const items = await (prisma as any)[model].findMany({
    where,
    orderBy,
    skip: cursor ? 1 : skip,
    take: take + 1,
    cursor: cursor ? { id: cursor } : undefined,
  });

  // Check if there are more items
  const hasMore = items.length > take;
  const data = items.slice(0, take).map((item: any) => ({
    node: item,
    cursor: item.id,
  }));

  return {
    data,
    pageInfo: {
      hasNextPage: hasMore,
      hasPreviousPage: skip > 0,
      startCursor: data[0]?.cursor || null,
      endCursor: data[data.length - 1]?.cursor || null,
    },
    totalCount,
  };
}
