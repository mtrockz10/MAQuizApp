export function normalizeQuestionnaire(data, quizId, defaults = {}) {
  if (!data || typeof data !== "object" || !Array.isArray(data.questions)) {
    throw new Error("The JSON file must contain a questions array.")
  }
  if (data.questions.length === 0) {
    throw new Error("The questionnaire does not contain any questions.")
  }

  return data.questions.map((item, index) => {
    const text = String(item.question ?? item.text ?? "").trim()
    if (!text) throw new Error(`Question ${index + 1} is missing question text.`)

    const rawOptions = Array.isArray(item.options) ? item.options : []
    const options = rawOptions.map((option, optionIndex) => ({
      id: `import-${index + 1}-${optionIndex + 1}`,
      text: String(typeof option === "string" ? option : option?.text ?? "").trim(),
    }))
    const correctAnswerValue = String(item.answer ?? item.correctAnswer ?? "").trim()
    const letterIndex = /^[A-Z]$/i.test(correctAnswerValue)
      ? correctAnswerValue.toUpperCase().charCodeAt(0) - 65
      : -1
    const answerText = String(item.answerText ?? "").trim()
    const answerTextIndex = answerText
      ? options.findIndex((option) => option.text.toLowerCase() === answerText.toLowerCase())
      : -1
    const numericIndex = /^\d+$/.test(correctAnswerValue)
      ? Number(correctAnswerValue)
      : -1
    const correctIndex = letterIndex >= 0
      ? letterIndex
      : answerTextIndex >= 0
        ? answerTextIndex
        : numericIndex

    if (options.length < 2 || options.some((option) => !option.text)) {
      throw new Error(`Question ${index + 1} must have at least two non-empty options.`)
    }
    if (correctIndex < 0 || correctIndex >= options.length) {
      throw new Error(`Question ${index + 1} has an invalid correct answer.`)
    }

    return {
      id: `imported-${item.id ?? index + 1}`,
      quizId,
      enabled: item.enabled !== false,
      type: "multiple_choice",
      text,
      image: item.image ?? null,
      options,
      correctAnswer: String(correctIndex),
      acceptedAnswers: [],
      explanation: String(item.explanation ?? ""),
      points: Number(item.points) || defaults.points || 10,
      pointsOverride: Boolean(item.pointsOverride),
      difficulty: item.difficulty || defaults.difficulty || "Easy",
      topic: item.category || item.topic || defaults.topic || "General",
      orderIndex: index + 1,
    }
  })
}
