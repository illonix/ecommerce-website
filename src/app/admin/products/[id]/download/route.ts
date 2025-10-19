import db from "@/db/db"
import { notFound } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // <-- params is a Promise
) {
  const { id } = await context.params // <-- await the Promise to get id
  const product = await db.product.findUnique({
    where: { id },
    select: { filePath: true, name: true },
  })

  if (product == null) return notFound()

  const { size } = await fs.stat(product.filePath)
  const file = await fs.readFile(product.filePath)
  const extension = product.filePath.split(".").pop()

  return new NextResponse(new Uint8Array(file), {headers: {
      "Content-Disposition": `attachment; filename="${product.name}.${extension}"`,
      "Content-Length": size.toString(),
    },
  })
}