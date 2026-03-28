import sql from "@/app/api/utils/sql";
import { verify } from "argon2";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password required" },
        { status: 400 },
      );
    }

    // Find user
    const [user] = await sql`
      SELECT id, email, name, role, password_hash 
      FROM users 
      WHERE email = ${email}
    `;

    if (!user) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Verify password
    const valid = await verify(user.password_hash, password);
    if (!valid) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
