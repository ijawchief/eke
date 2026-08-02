"use server";

import { cookies } from "next/headers";
import { getServiceClient } from "@/lib/supabase";
import crypto from "crypto";

async function setAuthCookie(name: string, value: string) {
  const cookieStore = await cookies();

  for (const cookieName of ["admin_token", "creator_id", "affiliate_id"]) {
    if (cookieName !== name) {
      cookieStore.set(cookieName, "", {
        expires: new Date(0),
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }
  }

  cookieStore.set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function loginAction(
  username: string,
  password: string
): Promise<{ error?: string; role?: string; redirect?: string }> {
  if (!username || !password) {
    return { error: "Username and password required" };
  }

  const db = getServiceClient();
  const normalized = username.toLowerCase().trim();
  const hash = crypto.createHash("sha256").update(password).digest("hex");

  // Master admin
  if (
    normalized === process.env.ADMIN_USERNAME?.toLowerCase() &&
    password === process.env.ADMIN_SECRET
  ) {
    await setAuthCookie("admin_token", process.env.ADMIN_SECRET!);
    return { role: "admin", redirect: "/admin" };
  }

  // DB admin
  const { data: dbAdmin } = await db
    .from("creator")
    .select("id")
    .or(`email.eq.${normalized},username.eq.${normalized}`)
    .eq("password_hash", hash)
    .eq("is_admin", true)
    .maybeSingle();

  if (dbAdmin) {
    await setAuthCookie("admin_token", process.env.ADMIN_SECRET!);
    return { role: "admin", redirect: "/admin" };
  }

  // Creator
  let { data: creator } = await db
    .from("creator")
    .select("id, name, password_hash")
    .eq("username", normalized)
    .maybeSingle();

  if (!creator) {
    const { data } = await db
      .from("creator")
      .select("id, name, password_hash")
      .eq("email", normalized)
      .maybeSingle();
    creator = data;
  }

  if (creator && creator.password_hash === hash) {
    await setAuthCookie("creator_id", creator.id);
    return { role: "creator", redirect: "/creator/dashboard" };
  }

  // Affiliate
  const { data: affiliate } = await db
    .from("affiliate")
    .select("id,password_hash,status,status_note")
    .or(`email.eq.${normalized},username.eq.${normalized}`)
    .maybeSingle();

  if (affiliate && affiliate.password_hash === hash) {
    if (affiliate.status === "banned") {
      return {
        error:
          "Your account has been banned." +
          (affiliate.status_note
            ? ` Reason: ${affiliate.status_note}`
            : ""),
      };
    }

    if (affiliate.status === "restricted") {
      return {
        error:
          "Your account has been restricted." +
          (affiliate.status_note
            ? ` Reason: ${affiliate.status_note}`
            : ""),
      };
    }

    await setAuthCookie("affiliate_id", affiliate.id);
    return { role: "affiliate", redirect: "/affiliate/dashboard" };
  }

  return { error: "Invalid username or password" };
}
