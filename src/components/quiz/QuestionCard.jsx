import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useToast } from "../../context/ToastContext"
import { cn } from "../../utils/cn"
import { Check, X, HelpCircle, RotateCw } from "lucide-react"
import { Button } from "../ui/Button"
import { Card } from "../ui/Card"
import { Badge } from "../ui/Badge"
import { Label } from "../ui/Label"
import { Input } from "../ui/Input"
import { getCorrectAnswerText, getCorrectOption, isAnswerCorrect } from "../../utils/quizAnswers"

const TYPE_LABELS = {
  multiple_choice: "Multiple Choice",
  true_false: "True / False",
  identification: "Identification",
}

export function QuestionCard({ question, currentIndex, total, onAnswer, disabled = false }) {
  const [userAnswer, setUserAnswer] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const toast = useToast()

  const isMC = question.type === "multiple_choice"
  const isTF = question.type === "true_false"
  const isID = question.type === "identification"

  const correctAnswer = getCorrectAnswerText(question)

  const handleSelect = (value) => {
    if (disabled || submitted) return
    setUserAnswer(value)
  }

  const handleSubmit = () => {
    if (disabled || submitted) return
    const correct = isAnswerCorrect(question, userAnswer)
    setIsCorrect(correct)
    setSubmitted(true)
    setShowFeedback(true)
    onAnswer({ questionId: question.id, answer: userAnswer, correct })
    if (!correct) toast.error("Not quite — check the explanation below!")
  }

  useEffect(() => {
    setUserAnswer("")
    setSubmitted(false)
    setIsCorrect(false)
    setShowFeedback(false)
  }, [question.id])

  const getOptionStatus = (optionId) => {
    const isSelected = userAnswer === optionId
    const isCorrectOpt = isMC
      ? getCorrectOption(question)?.id === optionId
      : optionId === question.correctAnswer
    if (!submitted) return isSelected ? "selected" : null
    if (isSelected && !isCorrectOpt) return "wrong"
    if (isCorrectOpt) return "correct"
    if (isSelected) return "wrong"
    return null
  }

  return (
    <Card className="p-0 sm:p-0 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <span className="text-xs font-bold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
          Question {currentIndex + 1} of {total}
        </span>
        <Badge variant="indigo" className="text-[10px]">
          {TYPE_LABELS[question.type]}
        </Badge>
      </div>

      <div className="p-6 sm:p-8">
        <div className="text-lg font-semibold heading text-gray-900 dark:text-gray-100 mb-2 leading-snug">
          {question.text}
        </div>
        {question.image && (
          <div className="my-4">
            <img src={question.image} alt="Question illustration" className="rounded-card w-full max-w-md mx-auto shadow-card" />
          </div>
        )}

        <div className="grid gap-3">
          {isMC && (
            <div className="grid gap-3">
              {question.options.map((opt) => {
                const status = getOptionStatus(opt.id)
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={userAnswer === opt.id}
                    onClick={() => handleSelect(opt.id)}
                    disabled={disabled || submitted}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3.5 text-left rounded-button border transition-all duration-200 text-sm font-medium",
                      status === "correct"
                        ? "bg-mint/50 border-mint/50 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-500/30 dark:text-emerald-300"
                        : status === "wrong"
                          ? "bg-red-50 border-red-100 text-red-800 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400 shake"
                          : status === "selected"
                            ? "bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-900/20 dark:border-indigo-500/30 dark:text-indigo-300"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    )}
                  >
                    <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full border text-[10px] font-bold">
                      {status === "correct" ? (
                        <Check size={12} strokeWidth={2.5} />
                      ) : status === "wrong" ? (
                        <X size={12} strokeWidth={2.5} />
                      ) : (
                        String.fromCharCode(65 + question.options.indexOf(opt))
                      )}
                    </span>
                    {opt.text}
                  </button>
                )
              })}
            </div>
          )}

          {isTF && (
            <div className="grid grid-cols-2 gap-3">
              {["true", "false"].map((val) => {
                const status = getOptionStatus(val)
                return (
                  <button
                    key={val}
                    type="button"
                    aria-pressed={userAnswer === val}
                    onClick={() => handleSelect(val)}
                    disabled={disabled || submitted}
                    className={cn(
                      "flex flex-col items-center justify-center px-4 py-6 rounded-card-lg border transition-all duration-200",
                      status === "correct"
                        ? "bg-mint/50 border-mint/200 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-500/30"
                        : status === "wrong"
                          ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-900/30 shake"
                          : status === "selected"
                            ? "bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-900/20 dark:border-indigo-500/30 dark:text-indigo-300"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    )}
                  >
                    <span className={cn("text-3xl font-bold mb-1", status === "correct" ? "text-emerald-500" : status === "wrong" ? "text-red-500" : "text-gray-900 dark:text-gray-200")}>
                      {val === "true" ? "True" : "False"}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {isID && (
            <div className="space-y-3">
              <Label>Your answer</Label>
              <Input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer..."
                disabled={disabled || submitted}
                autoComplete="off"
                spellCheck="false"
                className="input"
              />
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <HelpCircle size={14} className="shrink-0" />
                <span>Your answer is checked without regard to capitalization.</span>
              </div>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={disabled || submitted || !userAnswer.trim()}
                className="w-full"
              >
                {submitted ? <RotateCw size={16} className="mr-2" /> : "Submit Answer"}
              </Button>
            </div>
          )}
        </div>

        {(isMC || isTF) && !submitted && (
          <div className="mt-4 flex justify-end">
            <Button variant="primary" onClick={handleSubmit} disabled={!userAnswer}>
              Submit Answer
            </Button>
          </div>
        )}
      </div>

      {showFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 px-6 py-4 rounded-card border"
          style={{
            backgroundColor: isCorrect
              ? "rgba(45, 212, 167, 0.10)"
              : "rgba(255, 107, 107, 0.10)",
            borderColor: isCorrect
              ? "rgba(45, 212, 167, 0.35)"
              : "rgba(255, 107, 107, 0.35)",
          }}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              {isCorrect ? (
                <Check size={20} strokeWidth={2.5} className="text-emerald-500" />
              ) : (
                <X size={20} strokeWidth={2.5} className="text-red-500" />
              )}
            </div>
            <div className="flex-1">
              <p className={cn("font-semibold leading-snug", isCorrect ? "text-emerald-800 dark:text-emerald-400" : "text-red-800 dark:text-red-400")}>
                {isCorrect
                  ? "Correct! Great job."
                  : `Incorrect. The correct answer is: ${correctAnswer}`}
              </p>
              {question.explanation && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                  {question.explanation}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  )
}
