import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { CMS_TAG } from "@/lib/data";

/**
 * Optional instant refresh. Without it pages still refresh within ~60 seconds.
 * Sanity webhook: POST https://<site>/api/revalidate, secret = SANITY_REVALIDATE_SECRET.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: "Not configured" }, { status: 501 });

  const { isValidSignature } = await parseBody(req, secret);
  if (!isValidSignature) return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });

  revalidateTag(CMS_TAG, "max");
  return NextResponse.json({ ok: true, revalidated: CMS_TAG });
}
