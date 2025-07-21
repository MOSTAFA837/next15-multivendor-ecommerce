import { MessageCircleMore, MessageCircleQuestion } from "lucide-react";
import { FC } from "react";

interface Question {
  question: string;
  answer: string;
}

interface Props {
  questions: Question[];
}

export const Questions: FC<Props> = ({ questions }) => {
  return (
    <div className="pt-6">
      {/* List */}

      <ul className="space-y-5">
        {questions.map((question, i) => (
          <li key={i} className="relative mb-1">
            <div className="space-y-2">
              <div className="flex items-center gap-x-2">
                <MessageCircleQuestion className="w-4" />
                <p className="text-sm font-bold leading-5">
                  {question.question}
                </p>
              </div>

              <div className="flex items-center gap-x-2">
                <MessageCircleMore className="w-4" />
                <p className="text-sm leading-5">{question.answer}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
