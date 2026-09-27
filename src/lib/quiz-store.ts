import { useCallback, useEffect, useState } from "react";

export type Question = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};

export type Quiz = {
  id: string;
  title: string;
  category: string;
  description: string;
  minutes: number;
  questions: Question[];
};

export type Attempt = {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  total: number;
  takenAt: string;
};

const QUIZ_KEY = "quizdesk.quizzes.v1";
const ATTEMPT_KEY = "quizdesk.attempts.v1";

export const uid = () => Math.random().toString(36).slice(2, 10);

const seedQuizzes: Quiz[] = [
  {
    id: "seed-general",
    title: "General Knowledge Basics",
    category: "General",
    description: "A quick warm-up covering geography, science and everyday facts.",
    minutes: 5,
    questions: [
      {
        id: uid(),
        prompt: "What is the capital of Japan?",
        options: ["Kyoto", "Tokyo", "Osaka", "Nagoya"],
        correctIndex: 1,
      },
      {
        id: uid(),
        prompt: "How many continents are there?",
        options: ["5", "6", "7", "8"],
        correctIndex: 2,
      },
      {
        id: uid(),
        prompt: "Which gas do plants mainly absorb?",
        options: ["Oxygen", "Nitrogen", "Hydrogen", "Carbon dioxide"],
        correctIndex: 3,
      },
    ],
  },
  {
    id: "seed-web",
    title: "Web Development Fundamentals",
    category: "Technology",
    description: "Core concepts every front-end developer should recognise.",
    minutes: 10,
    questions: [
      {
        id: uid(),
        prompt: "What does HTML stand for?",
        options: [
          "Hyper Text Markup Language",
          "High Transfer Machine Language",
          "Hyperlink Text Mode Layout",
          "Home Tool Markup Language",
        ],
        correctIndex: 0,
      },
      {
        id: uid(),
        prompt: "Which CSS property controls text size?",
        options: ["text-style", "font-size", "text-scale", "size"],
        correctIndex: 1,
      },
      {
        id: uid(),
        prompt: "Which hook stores local state in React?",
        options: ["useEffect", "useMemo", "useState", "useRef"],
        correctIndex: 2,
      },
      {
        id: uid(),
        prompt: "What does an API endpoint usually return in web apps?",
        options: ["CSV only", "Binary only", "HTML only", "JSON"],
        correctIndex: 3,
      },
    ],
  },
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("quizdesk:change"));
}

export function useQuizDesk() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [ready, setReady] = useState(false);

  const sync = useCallback(() => {
    const stored = window.localStorage.getItem(QUIZ_KEY);
    if (!stored) {
      window.localStorage.setItem(QUIZ_KEY, JSON.stringify(seedQuizzes));
    }
    setQuizzes(read<Quiz[]>(QUIZ_KEY, seedQuizzes));
    setAttempts(read<Attempt[]>(ATTEMPT_KEY, []));
    setReady(true);
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("quizdesk:change", sync);
    return () => window.removeEventListener("quizdesk:change", sync);
  }, [sync]);

  const addQuiz = useCallback((quiz: Quiz) => {
    write(QUIZ_KEY, [quiz, ...read<Quiz[]>(QUIZ_KEY, [])]);
  }, []);

  const deleteQuiz = useCallback((id: string) => {
    write(
      QUIZ_KEY,
      read<Quiz[]>(QUIZ_KEY, []).filter((q) => q.id !== id),
    );
  }, []);

  const addAttempt = useCallback((attempt: Attempt) => {
    write(ATTEMPT_KEY, [attempt, ...read<Attempt[]>(ATTEMPT_KEY, [])]);
  }, []);

  return { quizzes, attempts, ready, addQuiz, deleteQuiz, addAttempt };
}
