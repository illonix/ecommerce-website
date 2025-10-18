import db from "@/db/db"
import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ downloadVerificationId: string }> }
) {
  const { downloadVerificationId } = await context.params

  const data = await db.downloadVerfication.findUnique({
    where: { id: downloadVerificationId, expiresAt: { gt: new Date() } },
    select: { product: { select: { filePath: true, name: true } } },
  })

  if (!data) {
    return NextResponse.redirect(new URL("/products/download/expired", req.url))
  }

  // Ensure path is correct
  const filePath = path.join(process.cwd(), data.product.filePath)

  try {
    const { size } = await fs.stat(filePath)
    const file = await fs.readFile(filePath)
    const extension = path.extname(filePath).slice(1)

    return new NextResponse(file, {
      headers: {
        "Content-Disposition": `attachment; filename="${data.product.name}.${extension}"`,
        "Content-Length": size.toString(),
      },
    })
  } catch (err: any) {
    console.error("Download error:", err)
    return NextResponse.redirect(new URL("/products/download/expired", req.url))
  }
}
