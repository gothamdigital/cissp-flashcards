/// <reference types="@cloudflare/workers-types" />
import { recordFeedback } from "../services/questionBank";

interface Env {
  DB?: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    if (!db) {
      // D1 not configured — silently succeed (graceful degradation)
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = (await context.request.json()) as {
      questionId?: string;
      isCorrect?: boolean;
    };

    if (!body.questionId || typeof body.isCorrect !== "boolean") {
      return new Response(
        JSON.stringify({ error: "Missing questionId or isCorrect" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await recordFeedback(db, body.questionId, body.isCorrect);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Feedback API Error:", error.message || error);
    return new Response(
      JSON.stringify({ error: "Failed to record feedback" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
