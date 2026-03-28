import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const clients = await sql`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.created_at,
        s.status as subscription_status,
        st.name as tier_name,
        st.price,
        s.trial_ends_at,
        s.current_period_end,
        (
          SELECT COUNT(*) 
          FROM usage_logs ul 
          WHERE ul.user_id = u.id 
          AND ul.logged_at >= CURRENT_DATE - INTERVAL '30 days'
        ) as usage_last_30_days
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      LEFT JOIN subscription_tiers st ON s.tier_id = st.id
      WHERE u.role = 'client'
      ORDER BY u.created_at DESC
    `;

    return Response.json({ clients });
  } catch (error) {
    console.error("Clients fetch error:", error);
    return Response.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}
