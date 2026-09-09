"use client";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface Props {
  content: string;
}

export default function MathRenderer({ content }: Props) {
  return (
    <div className="math-content text-gray-800 leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
