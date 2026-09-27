import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useQuizDesk } from "@/lib/quiz-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QuizDesk — calm online quiz management" },
      {
        name: "description",
        content:
          "Author question banks, publish them instantly, and let candidates take timed quizzes with automatic scoring.",
      },
      { property: "og:title", content: "QuizDesk — calm online quiz management" },
      {
        property: "og:description",
        content:
          "Author question banks, publish them instantly, and let candidates take timed quizzes with automatic scoring.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="surface-card p-6">
      <p className="font-display text-4xl">{value}</p>
      <p className="eyebrow mt-2">{label}</p>
    </div>
  );
}

function Index() {
  const { quizzes, attempts, deleteQuiz } = useQuizDesk();
  const questionCount = quizzes.reduce((n, q) => n + q.questions.length, 0);
  const average = attempts.length
    ? Math.round(
        attempts.reduce((n, a) => n + (a.score / a.total) * 100, 0) / attempts.length,
      )
    : 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <section className="max-w-2xl">
        <span className="inline-flex rounded-full border border-border bg-accent px-3 py-1 text-xs font-medium tracking-wide text-accent-foreground">
          Quiz management
        </span>
        <h1 className="mt-5 text-4xl leading-tight md:text-5xl">
          Run online quizzes from one calm, organised desk.
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Author question banks, publish them instantly, and let candidates take timed quizzes with
          automatic scoring and a full result history.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/create">
              <Plus className="size-4" /> Create a quiz
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/results">View results</Link>
          </Button>
        </div>
      </section>

      <section className="mt-14 grid gap-4 sm:grid-cols-3">
        <Stat value={String(quizzes.length)} label="Quizzes" />
        <Stat value={String(questionCount)} label="Questions" />
        <Stat value={`${average}%`} label="Average score" />
      </section>

      <section className="mt-16">
        <h2 className="text-2xl">Quiz library</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {quizzes.map((quiz) => (
            <article key={quiz.id} className="surface-card surface-card-hover flex flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg">{quiz.title}</h3>
                <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                  {quiz.category}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{quiz.description}</p>
              <p className="eyebrow mt-4">
                {quiz.questions.length} questions · {quiz.minutes} min
              </p>
              <div className="mt-6 flex items-center gap-2">
                <Button asChild className="flex-1">
                  <Link to="/quiz/$quizId" params={{ quizId: quiz.id }}>
                    Start quiz
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${quiz.title}`}
                  onClick={() => {
                    deleteQuiz(quiz.id);
                    toast.success("Quiz deleted.");
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </article>
          ))}
          {quizzes.length === 0 && (
            <div className="surface-card p-10 text-center md:col-span-2">
              <p className="text-sm text-muted-foreground">Your library is empty.</p>
              <Link
                to="/create"
                className="mt-3 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Create your first quiz
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
