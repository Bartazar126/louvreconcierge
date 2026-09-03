import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE_NAME = "louvre_admin_session";

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

export function createAdminSessionValue() {
  const adminPassword = getAdminPassword();

  if (!adminPassword) {
    throw new Error("Admin password is not configured.");
  }

  const signature = createHmac("sha256", adminPassword)
    .update("louvre-admin")
    .digest("hex");

  return `admin.${signature}`;
}

export function isAdminSessionValue(value?: string) {
  if (!value) {
    return false;
  }

  let expected: string;

  try {
    expected = createAdminSessionValue();
  } catch {
    return false;
  }

  const actualBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

export function isAdminPassword(value: FormDataEntryValue | null) {
  const adminPassword = getAdminPassword();

  return typeof value === "string" && Boolean(adminPassword) && value === adminPassword;
}

export const adminCookieOptions = {
  httpOnly: true,
  maxAge: 60 * 60 * 12,
  path: "/admin",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};
