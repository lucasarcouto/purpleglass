import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

interface LegalPageProps {
  title: string;
  markdownPath: string;
}

export function LegalPage({ title, markdownPath }: Readonly<LegalPageProps>) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(markdownPath)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load content");
        }
        return response.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [markdownPath]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="text-destructive">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-xl p-8 border border-border">
          <h1 className="text-4xl font-bold text-card-foreground mb-8">
            {title}
          </h1>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown components={markdownComponents}>
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-3xl font-bold mt-8 mb-4 text-card-foreground">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-semibold mt-6 mb-3 text-card-foreground">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-semibold mt-4 mb-2 text-card-foreground">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 text-card-foreground leading-relaxed">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-4 space-y-2 text-card-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-4 space-y-2 text-card-foreground">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="text-card-foreground">{children}</li>,
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-primary hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  code: ({ children }) => (
    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
      {children}
    </code>
  ),
};
