import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { FieldValue } from "firebase-admin/firestore";
import { Report } from "@/pdf/Report";
import { buildReport } from "@/lib/rules";
import { firestore, bucket, LEADS, publicFileUrl } from "@/lib/firebase";
import { sendReportEmail } from "@/lib/mailer";
import { FormPayload } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 30;

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  contact_method: z.string().min(1),
  contact_value: z.string().min(1),
  age_range: z.string().min(1),
  occupation: z.string().min(1),
  family: z.string().min(1),
  monthly_income: z.number().min(0),
  monthly_expense: z.number().min(0),
  monthly_saving: z.number().min(0),
  reserve_amount: z.number().min(0),
  asset_total: z.number().min(0),
  cash_liquid: z.number().min(0),
  debts: z.array(z.string()).min(1),
  debt_amount: z.string().optional(),
  goals: z.array(z.string()).min(1),
  goals_other: z.string().optional(),
  horizon: z.string().min(1),
  experience: z.array(z.string()).min(1),
  risk: z.string().min(1),
  protection: z.array(z.string()).min(1),
  premium: z.string().optional(),
  advanced_topics: z.array(z.string()).default([]),
  plans: z.array(z.string()).min(1),
  booked_slot: z.string().min(1),
  district: z.string().min(1),
  note: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "資料驗證失敗", details: parsed.error.flatten() }, { status: 400 });
    }
    const payload = parsed.data as FormPayload;

    // 1. 寫入 Firestore
    const docRef = await firestore().collection(LEADS).add({
      name: payload.name,
      email: payload.email,
      contact_method: payload.contact_method,
      contact_value: payload.contact_value,
      age_range: payload.age_range,
      occupation: payload.occupation,
      family: payload.family,
      monthly_income: payload.monthly_income,
      monthly_expense: payload.monthly_expense,
      monthly_saving: payload.monthly_saving,
      reserve_amount: payload.reserve_amount,
      asset_total: payload.asset_total,
      cash_liquid: payload.cash_liquid,
      debts: payload.debts,
      debt_amount: payload.debt_amount || null,
      goals: payload.goals,
      goals_other: payload.goals_other || null,
      horizon: payload.horizon,
      experience: payload.experience,
      risk: payload.risk,
      protection: payload.protection,
      premium: payload.premium || null,
      advanced_topics: payload.advanced_topics || [],
      plans: payload.plans,
      booked_slot: payload.booked_slot,
      district: payload.district,
      note: payload.note || null,
      status: "new",
      notes: "",
      report_url: null,
      created_at: FieldValue.serverTimestamp(),
    });

    // 2. 生成 PDF
    const reportData = buildReport(payload);
    const pdfBuffer = await renderToBuffer(
      React.createElement(Report, { data: reportData }) as any
    );

    // 3. 上傳到 Firebase Storage
    const path = `reports/${docRef.id}.pdf`;
    const file = bucket().file(path);
    await file.save(pdfBuffer, {
      contentType: "application/pdf",
      metadata: { cacheControl: "public, max-age=31536000" },
      resumable: false,
    });

    const url = publicFileUrl(path);
    await docRef.update({ report_url: url });

    // 4. 寄信給客戶（失敗也不影響主流程，只 log）
    try {
      await sendReportEmail({ to: payload.email, name: payload.name, pdf: pdfBuffer, reportUrl: url });
    } catch (mailErr) {
      console.error("[mailer] failed:", mailErr);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/dashboard");

    return NextResponse.json({ ok: true, id: docRef.id, report_url: url });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "server error" }, { status: 500 });
  }
}
