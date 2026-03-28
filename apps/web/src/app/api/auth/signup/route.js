import sql from "@/app/api/utils/sql";
import { hash } from "argon2";

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password required" },
        { status: 400 },
      );
    }

    // Check if user exists
    const [existing] = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing) {
      return Response.json({ error: "User already exists" }, { status: 409 });
    }

    // Hash password
    const password_hash = await hash(password);

    // Create user
    const [user] = await sql`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (${email}, ${password_hash}, ${name || null}, 'client')
      RETURNING id, email, name, role, created_at
    `;

    // Create trial subscription (30 days)
    const [tier] =
      await sql`SELECT id FROM subscription_tiers WHERE slug = 'starter'`;
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 30);

    await sql`
      INSERT INTO subscriptions (user_id, tier_id, status, trial_ends_at, current_period_start, current_period_end)
      VALUES (${user.id}, ${tier.id}, 'trial', ${trialEnds.toISOString()}, ${new Date().toISOString()}, ${trialEnds.toISOString()})
    `;

    return Response.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return Response.json({ error: "Signup failed" }, { status: 500 });
  }
}
