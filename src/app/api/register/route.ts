import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const usernameSchema = z
  .string()
  .min(4, "帳號至少 4 碼")
  .max(40)
  .regex(/^[a-zA-Z0-9_\u4e00-\u9fff]+$/, "帳號僅能使用英數、底線或中文");

const schema = z.object({
  name: z.string().min(1).max(50),
  username: usernameSchema,
  password: z.string().min(4, "密碼至少 4 碼").max(100),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "請檢查姓名、帳號與密碼（帳號與密碼皆至少 4 碼）" },
        { status: 400 }
      );
    }

    const username = parsed.data.username.trim().toLowerCase();
    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) {
      return NextResponse.json({ error: "此帳號已被註冊" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        username,
        passwordHash,
        profile: {
          create: {
            displayName: parsed.data.name,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, userId: user.id, username });
  } catch {
    return NextResponse.json({ error: "註冊失敗，請稍後再試" }, { status: 500 });
  }
}
