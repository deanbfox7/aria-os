import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return Response.json(
        { error: "Valid email is required" },
        { status: 400 },
      );
    }

    const [lead] = await sql`
      INSERT INTO aria_leads (email)
      VALUES (${email})
      ON CONFLICT (email) DO UPDATE SET created_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    return Response.json({ success: true, lead });
  } catch (error) {
    console.error("Error creating lead:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
