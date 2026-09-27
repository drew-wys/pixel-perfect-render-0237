import { createFileRoute, Link } from "@tanstack/react-router";

import { useQuizDesk } from "@/lib/quiz-store";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Results — QuizDesk" },
      {
        name: "description",
        content: "Every quiz attempt with its score, percentage and date, kept in your browser.",
      },
      { property: "og:title", content: "Results — QuizDesk" },
      {
        property: "og:description",
        content: "Every quiz attempt with its score, percentage and date, kept in your browser.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const { attempts, ready } = useQuizDesk();

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <p className="eyebrow">History</p>
      <h1 className="mt-2 text-3xl md:text-4xl">Result history</h1>

      {ready && attempts.length === 0 && (
        <div className="surface-card mt-10 p-10 text-center">
          <p className="text-sm text-muted-foreground">No attempts yet.</p>
          <Link to="/" className="mt-3 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">
            Take your first quiz
          </Link>
        </div>
      )}

      <div className="mt-8 space-y-3">
        {attempts.map((a) => {
          const pct = Math.round((a.score / a.total) * 100);
          return (
            <div key={a.id} className="surface-card flex items-center justify-between gap-4 p-5">
              <div>
                <p className="font-medium">{a.quizTitle}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(a.takenAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl">{pct}%</p>
                <p className="text-xs text-muted-foreground">
                  {a.score} / {a.total} correct
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
