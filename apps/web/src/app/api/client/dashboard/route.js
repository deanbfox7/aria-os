import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return Response.json({ error: "User ID required" }, { status: 400 });
    }

    // Get subscription details
    const [subscription] = await sql`
      SELECT 
        s.*,
        st.name as tier_name,
        st.price,
        st.features
      FROM subscriptions s
      JOIN subscription_tiers st ON s.tier_id = st.id
      WHERE s.user_id = ${userId}
      ORDER BY s.created_at DESC
      LIMIT 1
    `;

    // Get usage stats
    const usageStats = await sql`
      SELECT 
        service_type,
        COUNT(*) as count
      FROM usage_logs
      WHERE user_id = ${userId}
      AND logged_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY service_type
    `;

    // Get lead count
    const [leadCount] = await sql`
      SELECT COUNT(*) as total_leads
      FROM leads
      WHERE user_id = ${userId}
    `;

    // Get chatbot count
    const [chatbotCount] = await sql`
      SELECT COUNT(*) as total_chatbots
      FROM chatbots
      WHERE user_id = ${userId}
      AND is_active = true
    `;

    return Response.json({
      subscription: subscription || null,
      usage: usageStats.reduce((acc, item) => {
        acc[item.service_type] = parseInt(item.count);
        return acc;
      }, {}),
      stats: {
        total_leads: parseInt(leadCount.total_leads),
        active_chatbots: parseInt(chatbotCount.total_chatbots),
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return Response.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
