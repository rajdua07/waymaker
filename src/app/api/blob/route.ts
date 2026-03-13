import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Proxy route for private Vercel Blob files.
 * Authenticates the user, then fetches the blob using the server-side token
 * and streams the content back to the client.
 *
 * Usage: GET /api/blob?url=<encoded-blob-url>
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blobUrl = req.nextUrl.searchParams.get("url");
  if (!blobUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  // Validate it's a Vercel Blob URL (prevent open proxy / SSRF)
  const parsed = new URL(blobUrl);
  if (!parsed.hostname.endsWith(".blob.vercel-storage.com")) {
    return NextResponse.json({ error: "Invalid blob URL" }, { status: 400 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Blob storage not configured" },
      { status: 500 }
    );
  }

  // Fetch the private blob with the server-side token
  const blobResponse = await fetch(blobUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!blobResponse.ok) {
    return NextResponse.json(
      { error: "File not found" },
      { status: blobResponse.status }
    );
  }

  // Stream the blob content back with correct headers
  const contentType = blobResponse.headers.get("content-type") || "application/octet-stream";
  const contentLength = blobResponse.headers.get("content-length");
  const cacheControl = blobResponse.headers.get("cache-control") || "private, max-age=3600";

  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Cache-Control": cacheControl,
  };
  if (contentLength) {
    headers["Content-Length"] = contentLength;
  }

  return new NextResponse(blobResponse.body, {
    status: 200,
    headers,
  });
}
