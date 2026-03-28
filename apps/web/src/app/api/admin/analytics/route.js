import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    // Total MRR
    const [mrrData] = await sql`
      SELECT 
        COALESCE(SUM(st.price), 0) as mrr,
        COUNT(DISTINCT s.user_id) as active_clients
      FROM subscriptions s
      JOIN subscription_tiers st ON s.tier_id = st.id
      WHERE s.status IN ('active', 'trial')
    `;

    // New clients this month
    const [newClientsData] = await sql`
      SELECT COUNT(*) as new_clients
      FROM users
      WHERE role = 'client' 
      AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
    `;

    // Trial conversions this month
    const [trialData] = await sql`
      SELECT COUNT(*) as trial_conversions
      FROM subscriptions
      WHERE status = 'active'
      AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
      AND trial_ends_at < CURRENT_TIMESTAMP
    `;

    // Revenue by tier
    const revenueByTier = await sql`
      SELECT 
        st.name,
        st.price,
        COUNT(s.id) as subscriber_count,
        (st.price * COUNT(s.id)) as tier_revenue
      FROM subscription_tiers st
      LEFT JOIN subscriptions s ON st.id = s.tier_id AND s.status IN ('active', 'trial')
      GROUP BY st.id, st.name, st.price
      ORDER BY st.price ASC
    `;

    // Feature usage
    const featureUsage = await sql`
      SELECT 
        service_type,
        COUNT(*) as usage_count,
        COUNT(DISTINCT user_id) as unique_users
      FROM usage_logs
      WHERE logged_at >= DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY service_type
      ORDER BY usage_count DESC
    `;

    // Recent transactions
    const recentTransactions = await sql`
      SELECT 
        t.*,
        u.email as user_email,
        u.name as user_name
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.transaction_date DESC
      LIMIT 10
    `;

    // Churn risk (clients with low usage in last 7 days)
    const churnRisk = await sql`
      SELECT 
        u.id,
        u.email,
        u.name,
        st.name as tier,
        COUNT(ul.id) as recent_usage
      FROM users u
      JOIN subscriptions s ON u.id = s.user_id
      JOIN subscription_tiers st ON s.tier_id = st.id
      LEFT JOIN usage_logs ul ON u.id = ul.user_id AND ul.logged_at >= CURRENT_DATE - INTERVAL '7 days'
      WHERE s.status IN ('active', 'trial')
      AND u.role = 'client'
      GROUP BY u.id, u.email, u.name, st.name
      HAVING COUNT(ul.id) < 5
      ORDER BY recent_usage ASC
      LIMIT 10
    `;

    // Calculate estimated costs (10% of revenue for example)
    const estimatedCosts = parseFloat(mrrData.mrr) * 0.1;
    const profit = parseFloat(mrrData.mrr) - estimatedCosts;

    return Response.json({
      overview: {
        mrr: parseFloat(mrrData.mrr),
        arr: parseFloat(mrrData.mrr) * 12,
        active_clients: parseInt(mrrData.active_clients),
        new_clients_this_month: parseInt(newClientsData.new_clients),
        trial_conversions_this_month: parseInt(trialData.trial_conversions),
        estimated_costs: estimatedCosts,
        estimated_profit: profit,
      },
      revenue_by_tier: revenueByTier.map((tier) => ({
        name: tier.name,
        price: parseFloat(tier.price),
        subscribers: parseInt(tier.subscriber_count),
        revenue: parseFloat(tier.tier_revenue),
      })),
      feature_usage: featureUsage.map((f) => ({
        service: f.service_type,
        total_usage: parseInt(f.usage_count),
        unique_users: parseInt(f.unique_users),
      })),
      recent_transactions: recentTransactions,
      churn_risk_clients: churnRisk,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return Response.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
