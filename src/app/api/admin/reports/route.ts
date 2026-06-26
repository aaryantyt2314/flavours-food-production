import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get all orders
    const orders = await db.order.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, total: true, status: true, createdAt: true, paymentStatus: true },
    });

    // Revenue over time (last 30 days grouped by day)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentOrders = orders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo);

    const revenueByDay: Record<string, { revenue: number; orders: number }> = {};
    recentOrders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!revenueByDay[date]) revenueByDay[date] = { revenue: 0, orders: 0 };
      revenueByDay[date].revenue += order.total;
      revenueByDay[date].orders += 1;
    });

    const revenueChart = Object.entries(revenueByDay)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Order status distribution
    const statusCounts: Record<string, number> = {};
    orders.forEach(o => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    const statusChart = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

    // Top selling items
    const orderItems = await db.orderItem.findMany({
      select: { name: true, quantity: true, price: true },
    });

    const itemSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    orderItems.forEach(item => {
      if (!itemSales[item.name]) {
        itemSales[item.name] = { name: item.name, quantity: 0, revenue: 0 };
      }
      itemSales[item.name].quantity += item.quantity;
      itemSales[item.name].revenue += item.price * item.quantity;
    });

    const topItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Category distribution
    const menuItems = await db.menuItem.findMany({
      select: { category: { select: { name: true } } },
    });

    const categoryCounts: Record<string, number> = {};
    menuItems.forEach(item => {
      const cat = item.category?.name || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const categoryChart = Object.entries(categoryCounts).map(([category, count]) => ({ category, count }));

    // Summary stats
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
    const totalPaidRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

    // Payment method distribution
    const paymentMethodCounts: Record<string, number> = {};
    const allOrders = await db.order.findMany({ select: { paymentMethod: true } });
    allOrders.forEach(o => {
      paymentMethodCounts[o.paymentMethod] = (paymentMethodCounts[o.paymentMethod] || 0) + 1;
    });
    const paymentChart = Object.entries(paymentMethodCounts).map(([method, count]) => ({ method, count }));

    return NextResponse.json({
      summary: {
        totalOrders: orders.length,
        totalRevenue,
        totalPaidRevenue,
        avgOrderValue: orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0,
        paidOrdersCount: paidOrders.length,
      },
      revenueChart,
      statusChart,
      topItems,
      categoryChart,
      paymentChart,
    });
  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json({ error: 'Failed to generate reports' }, { status: 500 });
  }
}
