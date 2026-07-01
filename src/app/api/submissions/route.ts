import { NextResponse } from "next/server";

/* ------------------------------------------------------------------
   POST /api/submissions
   Receives a citizen submission (text + optional voice + optional
   photo + metadata) as multipart form data.

   This stub accepts and acknowledges the submission so the UI is fully
   functional in the hackathon demo. The commented steps below are the
   exact production wiring for Google Cloud — drop-in when the
   @google-cloud/* and Vertex AI SDKs are added.
   ------------------------------------------------------------------ */

export const runtime = "nodejs"; // needs Node APIs for streaming uploads

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const submission = {
      text: String(form.get("text") ?? ""),
      locale: String(form.get("locale") ?? "en"),
      category: String(form.get("category") ?? ""),
      location: String(form.get("location") ?? ""),
      coords: form.get("coords") ? JSON.parse(String(form.get("coords"))) : null,
      anonymous: form.get("anonymous") === "true",
      hasAudio: form.get("audio") instanceof File,
      hasPhoto: form.get("photo") instanceof File,
      createdAt: new Date().toISOString(),
    };

    // ---- PRODUCTION PIPELINE (Google Cloud) -------------------------
    // 1. Upload binaries to Cloud Storage (signed, private bucket):
    //      const bucket = new Storage().bucket(process.env.UPLOADS_BUCKET!);
    //      const audioFile = form.get("audio") as File | null; ...
    //
    // 2. If audio present → Speech-to-Text v2 (Chirp) transcription in
    //    the submitter's language; store transcript.
    //
    // 3. Classify + normalise with Claude Haiku 4.5 on Vertex AI
    //    (batched via a queue, not per-request, for cost control):
    //      - detect category, translate to English canonical text,
    //        extract the underlying "need", geo-tag to ward/village.
    //
    // 4. Write the record to Firestore (collection: "submissions") and
    //    update the rolling theme/hotspot aggregates.
    // -----------------------------------------------------------------

    const id = `sub_${Math.random().toString(36).slice(2, 10)}`;

    return NextResponse.json({ ok: true, id, submission }, { status: 201 });
  } catch (err) {
    console.error("submission error", err);
    return NextResponse.json({ ok: false, error: "Invalid submission" }, { status: 400 });
  }
}
