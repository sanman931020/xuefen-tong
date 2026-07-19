import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const usernameSchema = z
  .string()
  .min(4, "帳號至少 4 碼")
  .max(40)
  .regex(/^[a-zA-Z0-9_\u4e00-\u9fff]+$/, "帳號僅能使用英數、底線或中文");

const patchSchema = z.object({
  username: usernameSchema.optional(),
  currentPassword: z.string().max(100).optional(),
  newPassword: z.string().min(4, "密碼至少 4 碼").max(100).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      username: true,
      email: true,
      passwordHash: true,
      accounts: { select: { provider: true }, where: { provider: "google" } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "找不到使用者" }, { status: 404 });
  }

  return NextResponse.json({
    username: user.username,
    email: user.email,
    hasPassword: Boolean(user.passwordHash),
    hasGoogle: user.accounts.length > 0,
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "資料格式錯誤" },
      { status: 400 }
    );
  }

  const { username, currentPassword, newPassword } = parsed.data;
  if (!username && !newPassword) {
    return NextResponse.json({ error: "請填寫要變更的帳號或密碼" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "找不到使用者" }, { status: 404 });
  }

  if (username) {
    const nextUsername = username.trim().toLowerCase();
    if (nextUsername !== user.username) {
      const taken = await prisma.user.findUnique({ where: { username: nextUsername } });
      if (taken && taken.id !== user.id) {
        return NextResponse.json({ error: "此帳號已被使用" }, { status: 409 });
      }
    }
  }

  if (newPassword) {
    if (user.passwordHash) {
      if (!currentPassword) {
        return NextResponse.json({ error: "請輸入目前密碼" }, { status: 400 });
      }
      const ok = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!ok) {
        return NextResponse.json({ error: "目前密碼不正確" }, { status: 400 });
      }
    }
    // 尚未設密碼（例如 Google 登入）：可直接設定新密碼
    if (!user.username && !username) {
      return NextResponse.json(
        { error: "請先設定帳號，才能用帳號密碼登入" },
        { status: 400 }
      );
    }
  }

  const data: { username?: string; passwordHash?: string } = {};
  if (username) data.username = username.trim().toLowerCase();
  if (newPassword) data.passwordHash = await bcrypt.hash(newPassword, 10);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
    select: { username: true, passwordHash: true },
  });

  return NextResponse.json({
    ok: true,
    username: updated.username,
    hasPassword: Boolean(updated.passwordHash),
  });
}
