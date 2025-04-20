import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { randomUUID } from "crypto";

const midtransClient = require("midtrans-client");

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

const prisma = new PrismaClient();

export async function pay(req: Request, res: Response): Promise<any> {
  try {
    const { email, name, phone, id } = req.body;

    const orderId = randomUUID();
    const amount = 150000; // Amount in IDR

    let parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: name,
        email: email,
        phone: phone,
      },
    };

    const transaction = await snap.createTransaction(parameter);
    await prisma.payment.create({
      data: {
        amount,
        status: "pending",
        userId: id,
        orderId,
      },
    });
    res.status(200).json({ message: "Payment initiated", data: transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function handleNotification(req: Request, res: Response): Promise<any> {
  try {
    const { order_id, transaction_status, payment_type, transaction_time } = req.body;

    const payment = await prisma.payment.findFirst({
      where: { orderId: order_id },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (transaction_status === "capture") {
      if (payment_type === "credit_card") {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "success", paymentType: payment_type, paidAt: new Date(transaction_time).toISOString() },
        });
        await prisma.ticket.create({
          data: {
            userId: payment.userId,
            code: randomUUID(),
          },
        });
      }
    } else if (transaction_status === "settlement") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "success", paymentType: payment_type, paidAt: new Date(transaction_time).toISOString() },
      });
      await prisma.ticket.create({
        data: {
          userId: payment.userId,
          code: randomUUID(),
        },
      });
    } else if (transaction_status === "pending") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "pending" },
      });
    } else if (transaction_status === "deny") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "failed" },
      });
    } else if (transaction_status === "expire") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "expired" },
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
