export function getCorrectOption(question) {
  if (!question?.options?.length) return null
  return question.options.find((option) => option.id === question.correctAnswer) ||
    question.options[Number(question.correctAnswer)] ||
    null
}

export function isAnswerCorrect(question, answer) {
  if (answer === undefined || answer === null) return false

  if (question.type === "identification") {
    return (question.acceptedAnswers || []).some(
      (accepted) => accepted.trim().toLowerCase() === String(answer).trim().toLowerCase()
    )
  }

  if (question.type === "true_false") {
    return String(answer).toLowerCase() === String(question.correctAnswer).toLowerCase()
  }

  const correctOption = getCorrectOption(question)
  const selectedOption = question.options?.find((option) => option.id === answer) ||
    question.options?.[Number(answer)]
  return correctOption && selectedOption
    ? selectedOption.id === correctOption.id
    : String(answer) === String(question.correctAnswer)
}

export function getAnswerText(question, answer) {
  if (answer === undefined || answer === null || answer === "") return "No answer"
  if (question.type === "multiple_choice") {
    return question.options?.find((option) => option.id === answer)?.text ||
      question.options?.[Number(answer)]?.text ||
      String(answer)
  }
  if (question.type === "true_false") {
    return String(answer).toLowerCase() === "true" ? "True" : "False"
  }
  return String(answer)
}

export function getCorrectAnswerText(question) {
  if (question.type === "multiple_choice") {
    return getCorrectOption(question)?.text || String(question.correctAnswer ?? "")
  }
  if (question.type === "true_false") {
    return String(question.correctAnswer).toLowerCase() === "true" ? "True" : "False"
  }
  return (question.acceptedAnswers || []).join(" / ")
}
