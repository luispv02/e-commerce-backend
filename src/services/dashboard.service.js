
const { getDateRange, getGrouping, buildSalesTimeline } = require("../helpers/dashboard.helper");
const { dashboardRepository } = require("../repositories/postgres");

const getDashboardData = async (period = "30d") => {
  const { endDate, previousStartDate, startDate } = getDateRange(period);

  const groupBy = getGrouping(period);


  const [summary, previousSummary, sales, topProducts, recentOrders, newUsers] = await Promise.all([
    dashboardRepository.getOrdersSummary(startDate, endDate),
    dashboardRepository.getPreviousOrdersSummary(previousStartDate, startDate),
    dashboardRepository.getSalesTimeline({ startDate, endDate, groupBy }),
    dashboardRepository.getTopProducts(startDate, endDate),
    dashboardRepository.getRecentOrders(startDate, endDate),
    dashboardRepository.countNewUsers(startDate, endDate),
  ]);

  const currentSummary = summary || {};
  const totalRevenue = currentSummary.totalRevenue || 0;
  const totalOrders = currentSummary.totalOrders || 0;
  const unitsSold = currentSummary.unitsSold || 0;
  const averageOrderValue = totalOrders > 0 ? Math.round((totalRevenue / totalOrders)) : 0;
  const previousRevenue = previousSummary?.totalRevenue || 0;
  let growth = null; 
  if(previousRevenue > 0){ 
    growth = Number((((totalRevenue - previousRevenue) / previousRevenue) * 100 ).toFixed(1) ); 
  }else if(totalRevenue === 0){ 
    growth = 0; 
  }

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
      id: order.id,
      customerEmail: order.user.email || null,
      customerName: order.user.name || null,
      date: order.createdAt,
      total: Number(order.total),
    })),
    topProducts: topProducts.map((product) => ({
      ...product,
      percentage: totalRevenue
        ? Number(((product.revenue / totalRevenue) * 100).toFixed(1))
        : 0,
    })),
  };
};

module.exports = {
  getDashboardData,
};
