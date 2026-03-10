import { NextResponse } from "next/server";
import { deleteRecord, getRecordById, updateRecord } from "@/lib/db";
import type { Progress, ProgressUnit, RecordStatus } from "@/lib/data";
import { logError } from "@/lib/logger";
import { requireAdminPassword } from "@/lib/admin-auth-server";
import { syncToNeoDB } from "@/lib/providers/neodb-sync";
import { getNeoDBToken } from "@/lib/neodb-token";

export const runtime = "nodejs";

const STATUS_OPTIONS: RecordStatus[] = [
  "planned",
  "in_progress",
  "completed",
  "paused",
];

function normalizeNotes(notes: string | null | undefined): string | null | undefined {
  if (notes === undefined) return undefined;
  if (notes === null) return null;
  const trimmed = notes.trim();
  return trimmed || null;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  const auth = requireAdminPassword(request);
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }
  const body = (await request.json()) as {
    status?: RecordStatus;
    progress?: { current: number; total?: number; unit: ProgressUnit };
    note?: string;
    rating?: number | null;
    notes?: string | null;
  };

  if (!id) {
    return NextResponse.json({ error: "Missing record id." }, { status: 400 });
  }

  if (body.status && !STATUS_OPTIONS.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  let progress: Progress | undefined;
  if (body.progress) {
    const current = Number(body.progress.current);
    const total = body.progress.total === undefined ? undefined : Number(body.progress.total);
    if (Number.isNaN(current) || (total !== undefined && Number.isNaN(total)) || !body.progress.unit) {
      return NextResponse.json({ error: "Invalid progress values." }, { status: 400 });
    }
    progress = { current, total, unit: body.progress.unit };
  }

  let rating: number | null | undefined = undefined;
  if (body.rating !== undefined) {
    rating = body.rating === null ? null : (() => {
      const numericRating = Number(body.rating);
      if (Number.isNaN(numericRating)) {
        throw new Error("Invalid rating value.");
      }
      if (numericRating < 0 || numericRating > 10) {
        throw new Error("Rating must be between 0 and 10.");
      }
      return Math.round(numericRating * 10) / 10;
    })();
  }

  if (body.status === undefined && !progress && body.note === undefined && body.rating === undefined && body.notes === undefined) {
    return NextResponse.json({ error: "No updates provided." }, { status: 400 });
  }

  if (body.notes && typeof body.notes === "string" && body.notes.length > 200) {
    return NextResponse.json({ error: "评价不能超过 200 字" }, { status: 400 });
  }

  try {
    const updated = await updateRecord(id, {
      status: body.status,
      progress,
      historyNote: body.note,
      rating,
      notes: normalizeNotes(body.notes),
    });

    if (!updated) {
      return NextResponse.json({ error: "Record not found." }, { status: 404 });
    }

    // Sync to NeoDB if we have sourceIds.neodb and token
    const neodbId = updated.sourceIds?.neodb;
    if (neodbId) {
      try {
        const token = getNeoDBToken();
        if (token) {
          const syncResult = await syncToNeoDB(
            {
              type: updated.type,
              title: updated.title,
              originalTitle: updated.originalTitle,
              year: updated.year,
              summary: updated.summary,
              coverUrl: updated.coverUrl,
              status: updated.status,
              rating: updated.rating,
            },
            neodbId,
            token
          );

          if (!syncResult.success) {
            await logError("neodb sync failed on update (non-critical)", {
              recordId: id,
              neodbId,
              error: syncResult.error,
            });
          }
        }
      } catch (error) {
        await logError("neodb sync failed on update (non-critical)", {
          recordId: id,
          neodbId,
          error,
        });
      }
    }

    return NextResponse.json({ record: updated });
  } catch (error) {
    await logError("record update failed", { id, error, body });
    const errorMessage = error instanceof Error ? error.message : "Update failed.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  if (!id) {
    return NextResponse.json({ error: "Missing record id." }, { status: 400 });
  }
  const auth = requireAdminPassword(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const removed = await deleteRecord(id);
    if (!removed) {
      return NextResponse.json({ error: "Record not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    await logError("record delete failed", { id, error });
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }
}
