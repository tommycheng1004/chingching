import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { firestore, bucket, LEADS } from "@/lib/firebase";

// 注意：middleware 已驗證 cookie session，這裡不必再驗一次

function invalidate(id: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/${id}`);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  try {
    await firestore().collection(LEADS).doc(params.id).update({
      status: body.status,
      notes: body.notes,
    });
    invalidate(params.id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await bucket().file(`reports/${params.id}.pdf`).delete().catch(() => null);
    await firestore().collection(LEADS).doc(params.id).delete();
    invalidate(params.id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
