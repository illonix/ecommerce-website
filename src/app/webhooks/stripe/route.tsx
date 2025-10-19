import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import db from "../../../db/db";
import { Resend } from "resend";
import PurchaseReceiptEmail from "@/email/PurchaseReceipt"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: unknown) {
  if (err instanceof Error) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
  } else {
    console.error("❌ Webhook signature verification failed: Unknown error");
  }
  return new NextResponse("Invalid signature", { status: 400 });
}

  if (event.type === "charge.succeeded") {
    const charge = event.data.object;
    const productId = charge.metadata.productId;
    const email = charge.billing_details.email
    const pricePaidInCents = charge.amount;

    const product = await db.product.findUnique({ where: { id: productId } });

    if (product == null || email == null) {
      return new NextResponse("Product or email not found", { status: 400 });
    }

    const userFields = {
      email,
      orders: { create: { productId, pricePaidInCents } },
    };
    const {
      orders: [order],
    } = await db.user.upsert({
      where: { email },
      create: userFields,
      update: userFields,
      select: { orders: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    const downloadVerification = await db.downloadVerfication.create({
      data: {
        productId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });


    await resend.emails.send({
      from: `Support <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Order Confirmation",
      react: (
        <PurchaseReceiptEmail
          order={order}
          product={product}
          downloadVerificationId={downloadVerification.id}
        />
        ),
    });
  }
  return new NextResponse();
}
