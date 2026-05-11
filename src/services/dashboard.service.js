
const { getDateRange, getGrouping, buildSalesTimeline, getGroupId } = require("../helpers/dashboard.helper");
const { dashboardRepository } = require("../repositories");

const getDashboardData = async (period = "30d") => {
  const { endDate, previousStartDate, startDate } = getDateRange(period);

  const groupBy = getGrouping(period);
  let groupId = getGroupId(groupBy);

  const [summary, previousSummary, sales, topProducts, recentOrders, newUsers] = await Promise.all([
    dashboardRepository.getOrdersSummary(startDate, endDate),
    dashboardRepository.getPreviousOrdersSummary(previousStartDate, startDate),
    dashboardRepository.getSalesTimeline({ startDate, endDate, groupId }),
    dashboardRepository.getTopProducts(startDate, endDate),
    dashboardRepository.getRecentOrders(startDate, endDate),
    dashboardRepository.countNewUsers(startDate, endDate),
  ]);

  const currentSummary = summary[0] || {};
  const totalRevenue = currentSummary.totalRevenue || 0;
  const totalOrders = currentSummary.totalOrders || 0;
  const unitsSold = currentSummary.unitsSold || 0;
  const averageOrderValue = totalOrders > 0 ? Math.round((totalRevenue / totalOrders)) : 0;
  const previousRevenue = previousSummary[0]?.totalRevenue || 0;
  const growth = previousRevenue ? Number((((totalRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)): 0;

  return {
    summary: {
      totalRevenue,
      totalOrders,
      unitsSold,
      averageOrderValue,
      growth,
      newUsers,
    },
    sales: buildSalesTimeline(sales, startDate, endDate, groupBy),
    recentOrders: recentOrders.map((order) => ({
      id: order._id,
      customerEmail: order.user.email || null,
      customerName: order.user.name || null,
      date: order.createdAt,
      total: order.total,
    })),
    topProducts: topProducts.map((product) => ({
      id: product._id,
      name: product.name,
      units: product.units,
      revenue: product.revenue,
      image: product.image.url ?? null,
      percentage: totalRevenue
        ? Number(((product.revenue / totalRevenue) * 100).toFixed(1))
        : 0,
    })),
  };
};

module.exports = {
  getDashboardData,
};
