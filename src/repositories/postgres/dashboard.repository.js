const { Prisma } = require("../../generated/prisma");
const prisma = require("../../lib/prisma");

const getOrdersSummary = async (startDate, endDate) => {
  const [orders, orderItems] = await Promise.all([
    prisma.order.aggregate({
      where: { createdAt: { gte: startDate, lte: endDate } },
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.orderItem.aggregate({
      where: {
        order: {
          createdAt: { gte: startDate, lte: endDate },
        },
      },
      _sum: { quantity: true },
    }),
  ]);

  return {
    totalRevenue: Number(orders._sum.total || 0),
    totalOrders: orders._count.id || 0,
    unitsSold: orderItems._sum.quantity || 0,
  };
};

const getPreviousOrdersSummary = async (previousStartDate, startDate) => {
  const result = await prisma.order.aggregate({
    where: { createdAt: { gte: previousStartDate, lt: startDate } },
    _sum: { total: true },
  });

  return { totalRevenue: Number(result._sum.total || 0) };
};

const getSalesTimeline = async ({ startDate, endDate, groupBy }) => {
  let selectExpr;
  let groupByExpr;
  let orderByExpr;
  let transform;

  if (groupBy === "day") {
    selectExpr = Prisma.sql`TO_CHAR("createdAt", 'YYYY-MM-DD') AS "id"`;
    groupByExpr = Prisma.sql`TO_CHAR("createdAt", 'YYYY-MM-DD')`;
    orderByExpr = Prisma.sql`"id" ASC`;
    transform = (rows) => rows;
  } else if (groupBy === "week") {
    selectExpr = Prisma.sql`EXTRACT(ISOYEAR FROM "createdAt")::int AS year, EXTRACT(WEEK FROM "createdAt")::int AS week`;
    groupByExpr = Prisma.sql`EXTRACT(ISOYEAR FROM "createdAt"), EXTRACT(WEEK FROM "createdAt")`;
    orderByExpr = Prisma.sql`year ASC, week ASC`;
    transform = (rows) =>
      rows.map((row) => ({
        id: { year: row.year, week: row.week },
        revenue: row.revenue,
      }));
  } else if (groupBy === "month") {
    selectExpr = Prisma.sql`EXTRACT(YEAR FROM "createdAt")::int AS year, EXTRACT(MONTH FROM "createdAt")::int AS month`;
    groupByExpr = Prisma.sql`EXTRACT(YEAR FROM "createdAt"), EXTRACT(MONTH FROM "createdAt")`;
    orderByExpr = Prisma.sql`year ASC, month ASC`;
    transform = (rows) =>
      rows.map((row) => ({
        id: { year: row.year, month: row.month },
        revenue: row.revenue,
      }));
  }

  if (!selectExpr) throw new Error("groupBy inválido");

  const rows = await prisma.$queryRaw`
    SELECT
      ${selectExpr},
      SUM(total)::float AS revenue
    FROM orders
    WHERE "createdAt" >= ${startDate}
      AND "createdAt" <= ${endDate}
    GROUP BY ${groupByExpr}
    ORDER BY ${orderByExpr}
  `;

  return transform(rows);
};

const getTopProducts = async (startDate, endDate) => {
  const rows = await prisma.$queryRaw` 
    SELECT 
      oi."productId" AS id, 
      MAX(oi.title) AS name, 
      SUM(oi.quantity)::int AS units, 
      SUM(oi.quantity * oi."pricePaid")::numeric AS revenue, 
      MAX(( 
        SELECT pi.url 
        FROM product_images pi 
        WHERE pi."productId" = oi."productId" 
        LIMIT 1 
      )) AS image 
    FROM order_items oi 
    INNER JOIN orders o ON o.id = oi."orderId" 
    WHERE o."createdAt" >= ${startDate} AND o."createdAt" <= ${endDate} 
    GROUP BY oi."productId" 
    ORDER BY units DESC, revenue DESC 
    LIMIT 5 
  `;

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    units: row.units,
    revenue: Number(row.revenue),
    image: row.image ?? null,
  }));
};

const getRecentOrders = async (startDate, endDate) => {
  return prisma.order.findMany({
    where: { createdAt: { gte: startDate, lte: endDate } },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
};

const countNewUsers = async (startDate, endDate) => {
  return prisma.user.count({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      role: { not: "admin" },
    },
  });
};

module.exports = {
  getOrdersSummary,
  getPreviousOrdersSummary,
  getSalesTimeline,
  getTopProducts,
  getRecentOrders,
  countNewUsers,
};
