import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { uid, useQuizDesk } from "@/lib/quiz-store";

export const Route = createFileRoute("/quiz/$quizId")({
  head: () => ({
    meta: [
      { title: "Take a quiz — QuizDesk" },
      {
        name: "description",
        content: "Answer a timed quiz question by question and get scored automatically.",
      },
      { property: "og:title", content: "Take a quiz — QuizDesk" },
      {
        property: "og:description",
        content: "Answer a timed quiz question by question and get scored automatically.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TakeQuizPage,
});

function TakeQuizPage() {
  const { quizId } = useParams({ from: "/quiz/$quizId" });
  const { quizzes, ready, addAttempt } = useQuizDesk();
  const quiz = useMemo(() => quizzes.find((q) => q.id === quizId), [quizzes, quizId]);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (quiz && secondsLeft === null) setSecondsLeft(quiz.minutes * 60);
  }, [quiz, secondsLeft]);

  useEffect(() => {
    if (submitted || secondsLeft === null) return;
    if (secondsLeft <= 0) {
      setSubmitted(true);
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, submitted]);

  const score = quiz
    ? quiz.questions.filter((q) => answers[q.id] === q.correctIndex).length
    : 0;

  useEffect(() => {
    if (!submitted || !quiz) return;
    addAttempt({
      id: uid(),
      quizId: quiz.id,
      quizTitle: quiz.title,
      score,
      total: quiz.questions.length,
      takenAt: new Date().toISOString(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  if (!ready) return <div className="mx-auto max-w-2xl px-6 py-20 text-sm text-muted-foreground">Loading…</div>;

  if (!quiz)
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="text-2xl">Quiz not found</h1>
        <Link to="/" className="mt-4 inline-block text-sm text-primary underline-offset-4 hover:underline">
          Back to library
        </Link>
      </div>
    );

  if (submitted) {
    const pct = Math.round((score / quiz.questions.length) * 100);
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="surface-card p-10 text-center">
          <p className="eyebrow">Result</p>
          <p className="mt-3 font-display text-6xl">{pct}%</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {score} of {quiz.questions.length} correct on {quiz.title}
          </p>
          <div className="mt-8 space-y-3 text-left">
            {quiz.questions.map((q, i) => {
              const picked = answers[q.id];
              const right = picked === q.correctIndex;
              return (
                <div key={q.id} className="rounded-lg border border-border bg-secondary/40 p-4">
                  <p className="text-sm font-medium">
                    {i + 1}. {q.prompt}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your answer: {picked === undefined ? "—" : q.options[picked]}
                    {!right && ` · Correct: ${q.options[q.correctIndex]}`}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild>
              <Link to="/">Back to library</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/results">View results</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const q = quiz.questions[index];
  const mm = String(Math.floor((secondsLeft ?? 0) / 60)).padStart(2, "0");
  const ss = String((secondsLeft ?? 0) % 60).padStart(2, "0");

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">{quiz.category}</p>
          <h1 className="mt-1 text-2xl">{quiz.title}</h1>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm tabular-nums">
          <Clock className="size-4 text-primary" />
          {mm}:{ss}
        </span>
      </div>

      <Progress value={((index + 1) / quiz.questions.length) * 100} className="mt-6" />
      <p className="mt-2 text-xs text-muted-foreground">
        Question {index + 1} of {quiz.questions.length}
      </p>

      <div className="surface-card mt-6 p-6">
        <p className="text-lg">{q.prompt}</p>
        <div className="mt-5 space-y-3">
          {q.options.map((opt, oi) => {
            const active = answers[q.id] === oi;
            return (
              <button
                key={oi}
                type="button"
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                  active
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-border bg-card hover:bg-secondary"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
          Previous
        </Button>
        {index === quiz.questions.length - 1 ? (
          <Button onClick={() => setSubmitted(true)}>Submit quiz</Button>
        ) : (
          <Button onClick={() => setIndex((i) => i + 1)}>Next</Button>
        )}
      </div>
    </div>
  );
}
