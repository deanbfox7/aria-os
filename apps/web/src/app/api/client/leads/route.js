import sql from "@/app/api/utils/sql";

// Get all leads for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "User ID required" }, { status: 400 });
    }

    const leads = await sql`
      SELECT *
      FROM leads
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    return Response.json({ leads });
  } catch (error) {
    console.error("Leads fetch error:", error);
    return Response.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

// Create a new lead
export async function POST(request) {
  try {
    const { userId, email, name, phone, company, source } =
      await request.json();

    if (!userId) {
      return Response.json({ error: "User ID required" }, { status: 400 });
    }

    const [lead] = await sql`
      INSERT INTO leads (user_id, email, name, phone, company, source, status, score)
      VALUES (${userId}, ${email || null}, ${name || null}, ${phone || null}, ${company || null}, ${source || "manual"}, 'new', 50)
      RETURNING *
    `;

    // Log usage
    await sql`
      INSERT INTO usage_logs (user_id, service_type, quantity)
      VALUES (${userId}, 'lead_gen', 1)
    `;

    return Response.json({ lead }, { status: 201 });
  } catch (error) {
    console.error("Lead creation error:", error);
    return Response.json({ error: "Failed to create lead" }, { status: 500 });
  }
}

// Update lead status
export async function PATCH(request) {
  try {
    const { leadId, status, score } = await request.json();

    if (!leadId) {
      return Response.json({ error: "Lead ID required" }, { status: 400 });
    }

    const [lead] = await sql`
      UPDATE leads
      SET 
        status = COALESCE(${status}, status),
        score = COALESCE(${score}, score),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${leadId}
      RETURNING *
    `;

    return Response.json({ lead });
  } catch (error) {
    console.error("Lead update error:", error);
    return Response.json({ error: "Failed to update lead" }, { status: 500 });
  }
}
