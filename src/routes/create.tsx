import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uid, useQuizDesk, type Question } from "@/lib/quiz-store";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create a quiz — QuizDesk" },
      {
        name: "description",
        content: "Author a question bank, set a time limit, and publish a quiz instantly on QuizDesk.",
      },
      { property: "og:title", content: "Create a quiz — QuizDesk" },
      {
        property: "og:description",
        content: "Author a question bank, set a time limit, and publish a quiz instantly on QuizDesk.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreateQuizPage,
});

const emptyQuestion = (): Question => ({
  id: uid(),
  prompt: "",
  options: ["", "", "", ""],
  correctIndex: 0,
});

function CreateQuizPage() {
  const navigate = useNavigate();
  const { addQuiz } = useQuizDesk();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [minutes, setMinutes] = useState(5);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    setQuestions((qs) => (qs.length ? qs : [emptyQuestion()]));
  }, []);

  const update = (id: string, patch: Partial<Question>) =>
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Give the quiz a title.");
      return;
    }
    const cleaned = questions
      .map((q) => ({ ...q, prompt: q.prompt.trim(), options: q.options.map((o) => o.trim()) }))
      .filter((q) => q.prompt && q.options.every(Boolean));
    if (!cleaned.length) {
      toast.error("Add at least one question with all four answer options filled in.");
      return;
    }

    addQuiz({
      id: uid(),
      title: title.trim(),
      category: category.trim() || "General",
      description: description.trim() || "No description provided.",
      minutes: Number(minutes) || 5,
      questions: cleaned,
    });
    toast.success("Quiz published to your library.");
    navigate({ to: "/" });
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <p className="eyebrow">New quiz</p>
      <h1 className="mt-2 text-3xl md:text-4xl">Author a question bank</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Four answer options per question. Mark the correct one and it is scored automatically.
      </p>

      <form onSubmit={submit} className="mt-10 space-y-8">
        <div className="surface-card space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Quiz title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Data Basics" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Technology"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this quiz covers."
            />
          </div>
          <div className="space-y-2 sm:w-40">
            <Label htmlFor="minutes">Duration (min)</Label>
            <Input
              id="minutes"
              type="number"
              min={1}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
            />
          </div>
        </div>

        {questions.map((q, qi) => (
          <div key={q.id} className="surface-card space-y-4 p-6">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Question {qi + 1}</p>
              {questions.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuestions((qs) => qs.filter((x) => x.id !== q.id))}
                  aria-label="Remove question"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
            <Input
              value={q.prompt}
              onChange={(e) => update(q.id, { prompt: e.target.value })}
              placeholder="Type the question"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {q.options.map((opt, oi) => (
                <label
                  key={oi}
                  className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-2"
                >
                  <input
                    type="radio"
                    name={`correct-${q.id}`}
                    checked={q.correctIndex === oi}
                    onChange={() => update(q.id, { correctIndex: oi })}
                    className="accent-[var(--primary)]"
                  />
                  <Input
                    value={opt}
                    onChange={(e) =>
                      update(q.id, {
                        options: q.options.map((o, i) => (i === oi ? e.target.value : o)),
                      })
                    }
                    placeholder={`Option ${oi + 1}`}
                    className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                  />
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Select the radio next to the correct answer.</p>
          </div>
        ))}

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={() => setQuestions((qs) => [...qs, emptyQuestion()])}>
            <Plus className="size-4" /> Add question
          </Button>
          <Button type="submit">Publish quiz</Button>
        </div>
      </form>
    </div>
  );
}
