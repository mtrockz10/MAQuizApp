import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useQuiz } from "../../context/QuizContext"
import { useToast } from "../../context/ToastContext"
import { questionService, quizService } from "../../services/api"
import { normalizeQuestionnaire } from "../../utils/questionnaireImport"
import {
  Plus, Trash2, ArrowUp, ArrowDown, Edit, Save, Search, FileText, Upload, Eye, EyeOff,
  X, HelpCircle, Loader2,
} from "lucide-react"
import { cn } from "../../utils/cn"
import { Card } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Textarea } from "../../components/ui/Input"
import { Label } from "../../components/ui/Label"
import { Modal } from "../../components/ui/Modal"
import { QUESTION_TYPES, TOPICS, DIFFICULTIES } from "../../utils/constants"
import { QuestionCard } from "../../components/quiz/QuestionCard"

export default function QuestionBuilder() {
  const { quizId } = useParams()
  const { quizzes, refresh, settings } = useQuiz()
  const toast = useToast()
  const quiz = quizzes.find((item) => item.id === quizId)
  const [questions, setQuestions] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [loading, setLoading] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [csvText, setCsvText] = useState("")
  const [attemptQuestionCount, setAttemptQuestionCount] = useState(null)

  // editing state
  const [draft, setDraft] = useState(null)
  const [previewSubmitted, setPreviewSubmitted] = useState(false)
  const [previewResult, setPreviewResult] = useState(null)
  useEffect(() => {
    setLoading(true)
    try {
      setQuestions(questionService.listByQuiz(quizId))
    } finally {
      setLoading(false)
    }
  }, [quizId])

  const filtered = questions.filter((q) => {
    const m = q.text.toLowerCase().includes(search.toLowerCase())
    const t = typeFilter === "all" || q.type === typeFilter
    return m && t
  })
  const enabledQuestionCount = questions.filter((question) => question.enabled !== false).length

  const startNew = () => {
    setSelectedId(null)
    setDraft({
      id: null,
      quizId,
      type: QUESTION_TYPES.MULTIPLE_CHOICE,
      text: "",
      image: "",
      options: [],
      correctAnswer: "",
      acceptedAnswers: [],
      explanation: "",
      points: settings?.pointsByDifficulty?.Easy ?? 10,
      pointsOverride: false,
      difficulty: "Easy",
      topic: TOPICS[0],
      orderIndex: questions.length + 1,
    })
  }

  const editQuestion = (q) => {
    setSelectedId(q.id)
    setDraft({ ...q, options: [...(q.options || [])], acceptedAnswers: [...(q.acceptedAnswers || [])] })
  }

  const isMC = draft?.type === QUESTION_TYPES.MULTIPLE_CHOICE
  const isTF = draft?.type === QUESTION_TYPES.TRUE_FALSE
  const isID = draft?.type === QUESTION_TYPES.IDENTIFICATION

  const handleSave = () => {
    if (!draft.text.trim()) return toast.error("Question text is required.")
    if (isMC && (!draft.correctAnswer || draft.options.length < 2)) {
      return toast.error("Add at least 2 options and pick a correct answer.")
    }
    if (isID && draft.acceptedAnswers.length === 0) {
      return toast.error("Add at least one accepted answer.")
    }

    const payload = { ...draft }
    if (isTF) {
      payload.options = [
        { id: "opt-true", text: "True" },
        { id: "opt-false", text: "False" },
      ]
    }

    try {
      if (draft.id) {
        questionService.update(draft.id, payload)
        toast.success("Question updated")
      } else {
        questionService.create(payload)
        toast.success("Question created")
      }
      setQuestions(questionService.listByQuiz(quizId))
      refresh()
      setDraft(null)
      setSelectedId(null)
    } catch (err) {
      toast.error(err.message || "Save failed")
    }
  }

  const handleDelete = (id) => {
    if (!window.confirm("Delete this question?")) return
    try {
      questionService.delete(id)
      setQuestions(questionService.listByQuiz(quizId))
      refresh()
      if (selectedId === id) { setDraft(null); setSelectedId(null) }
      toast.success("Question deleted")
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleToggleQuestion = (question) => {
    const enabled = question.enabled === false
    try {
      questionService.update(question.id, { enabled })
      setQuestions(questionService.listByQuiz(quizId))
      refresh()
      toast.success(enabled ? "Question enabled for quizzes" : "Question excluded from quizzes")
    } catch (err) {
      toast.error(err.message || "Unable to update question status.")
    }
  }

  const handleSaveAttemptCount = () => {
    const count = Number(attemptQuestionCount ?? quiz?.questionCount ?? 15)
    if (!Number.isInteger(count) || count < 1 || count > enabledQuestionCount) {
      return toast.error(`Choose a whole number from 1 to ${enabledQuestionCount} enabled questions.`)
    }
    try {
      quizService.update(quizId, { questionCount: count })
      refresh()
      toast.success(`Each attempt will draw ${count} questions`)
    } catch (err) {
      toast.error(err.message || "Unable to update attempt size.")
    }
  }

  const handleJsonImport = async (event) => {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (!file) return

    try {
      const bank = JSON.parse(await file.text())
      const rows = normalizeQuestionnaire(bank, quizId, {
        difficulty: "Easy",
        points: settings?.pointsByDifficulty?.Easy ?? 10,
        topic: quiz?.topic || TOPICS[0],
      })
      const confirmed = window.confirm(
        `Replace the current question bank (${questions.length} questions) with ${rows.length} questions from "${file.name}"?`
      )
      if (!confirmed) return

      questionService.replaceByQuiz(quizId, rows)
      setQuestions(questionService.listByQuiz(quizId))
      refresh()
      setBulkOpen(false)
      toast.success(`Imported ${rows.length} questions from JSON`)
    } catch (err) {
      toast.error(err.message || "JSON import failed.")
    } finally {
      input.value = ""
    }
  }

  const handleBulkImport = async () => {
    try {
      const rows = csvText
        .trim()
        .split("\n")
        .slice(1)
        .filter((l) => l.trim())
        .map((line) => {
          const cols = line.split(",")
          return {
            text: cols[0],
            type: cols[1] || QUESTION_TYPES.MULTIPLE_CHOICE,
            options: (cols[2] || "").split("|").filter(Boolean),
            correctAnswer: cols[3] || "0",
            acceptedAnswers: (cols[4] || "").split("|").filter(Boolean),
            explanation: cols[5] || "",
            points: Number(cols[6]) || 10,
            difficulty: cols[7] || "Easy",
            topic: cols[8] || TOPICS[0],
            quizId,
            orderIndex: Date.now(),
          }
        })
      questionService.bulkImport(rows)
      setQuestions(questionService.listByQuiz(quizId))
      refresh()
      setCsvText("")
      setBulkOpen(false)
      toast.success(`Imported ${rows.length} questions`)
    } catch (err) {
      toast.error(err.message || "Import failed")
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100svh-160px)]">
      {/* Left: question bank */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold heading text-gray-900 dark:text-white">Question bank</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {enabledQuestionCount} enabled of {questions.length} questions · {quiz?.questionCount ?? 15} configured per attempt
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setBulkOpen(true)} className="text-xs">
              <Upload size={14} className="mr-1" /> Bulk import
            </Button>
            <Button variant="primary" size="sm" onClick={startNew} className="text-xs">
              <Plus size={14} className="mr-1" /> New
            </Button>
          </div>
        </div>

        <Card className="mb-4 p-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="w-full sm:max-w-xs">
              <Label htmlFor="attempt-question-count">Questions per attempt</Label>
              <Input
                id="attempt-question-count"
                type="number"
                min="1"
                max={enabledQuestionCount}
                value={attemptQuestionCount ?? String(quiz?.questionCount ?? 15)}
                onChange={(event) => setAttemptQuestionCount(event.target.value)}
              />
            </div>
            <Button
              variant="secondary"
              onClick={handleSaveAttemptCount}
              disabled={
                !enabledQuestionCount ||
                Number(attemptQuestionCount ?? quiz?.questionCount ?? 15) === Number(quiz?.questionCount)
              }
            >
              Save attempt size
            </Button>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Students receive random enabled questions only. If fewer are enabled than configured, the attempt uses all enabled questions.
          </p>
        </Card>

        <div className="mb-4">
          <Input
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={16} strokeWidth={2} />}
          />
        </div>

        <div className="flex gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => setTypeFilter("all")} className={typeFilter === "all" ? "bg-gray-100 dark:bg-gray-800" : ""}>
            All
          </Button>
          {[QUESTION_TYPES.MULTIPLE_CHOICE, QUESTION_TYPES.TRUE_FALSE, QUESTION_TYPES.IDENTIFICATION].map((t) => (
            <Button key={t} variant="ghost" size="sm" onClick={() => setTypeFilter(t)} className={typeFilter === t ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" : ""}>
              {t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </Button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-2">
              <Loader2 size={24} className="animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading questions...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-2">
              {filtered.map((q) => (
                <div
                  key={q.id}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-button border transition-all",
                    selectedId === q.id
                      ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-900/50"
                      : q.enabled === false
                        ? "bg-gray-50 border-gray-200 dark:bg-gray-900/50 dark:border-gray-700 opacity-75"
                        : "bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                >
                  <button type="button" className="flex-1 min-w-0 text-left" onClick={() => editQuestion(q)}>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{q.text}</p>
                    <div className="flex items-center gap-2 text-[10px] mt-1">
                      <Badge variant="gray" className="text-[9px]">{q.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</Badge>
                      <Badge variant="gray" className="text-[9px]">{q.difficulty}</Badge>
                      <Badge variant={q.enabled === false ? "gray" : "mint"} className="text-[9px]">
                        {q.enabled === false ? "Disabled" : "Enabled"}
                      </Badge>
                      <Badge variant="gray" className="text-[9px]">
                        {q.pointsOverride ? q.points : settings?.pointsByDifficulty?.[q.difficulty] ?? q.points} pts
                      </Badge>
                    </div>
                  </button>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleQuestion(q)}
                      aria-label={`${q.enabled === false ? "Enable" : "Disable"} question: ${q.text}`}
                      title={q.enabled === false ? "Enable for quizzes" : "Disable for quizzes"}
                    >
                      {q.enabled === false ? <Eye size={14} /> : <EyeOff size={14} />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => editQuestion(q)} aria-label={`Edit question: ${q.text}`}>
                      <Edit size={14} strokeWidth={2} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(q.id)} className="text-red-400 hover:text-red-600" aria-label={`Delete question: ${q.text}`}>
                      <Trash2 size={14} strokeWidth={2} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">No questions match your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: editor + preview */}
      <div className="w-full lg:w-3/4 flex flex-col min-w-0">
        {draft ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold heading text-gray-900 dark:text-white">Question editor</h2>
              <Button variant="outline" size="sm" onClick={() => { setDraft(null); setSelectedId(null) }}>
                <X size={16} /> Close
              </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Editor */}
              <div className="space-y-4">
                <Card className="p-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Question type</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {[QUESTION_TYPES.MULTIPLE_CHOICE, QUESTION_TYPES.TRUE_FALSE, QUESTION_TYPES.IDENTIFICATION].map((t) => (
                          <button
                            key={t}
                            onClick={() => setDraft({ ...draft, type: t, options: t === QUESTION_TYPES.TRUE_FALSE ? [{ id: "opt-true", text: "True" }, { id: "opt-false", text: "False" }] : [], correctAnswer: "" })}
                            className={cn(
                              "px-3 py-2 rounded-button border text-sm font-medium transition-colors",
                              draft.type === t
                                ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-900/50"
                                : "bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            )}
                          >
                            {t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Question text</Label>
                      <Textarea
                        value={draft.text}
                        onChange={(e) => setDraft({ ...draft, text: e.target.value })}
                        placeholder="e.g. What should you do if you arrive late on your first day?"
                        rows={3}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Image URL (optional)</Label>
                        <Input value={draft.image || ""} onChange={(e) => setDraft({ ...draft, image: e.target.value })} placeholder="https://..." />
                      </div>
                      <div>
                        <Label>Points override (optional)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={draft.pointsOverride
                            ? draft.points
                            : settings?.pointsByDifficulty?.[draft.difficulty] ?? draft.points ?? 10}
                          onChange={(e) => setDraft({ ...draft, points: Number(e.target.value) || 0, pointsOverride: true })}
                        />
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                          Leave unchanged to use the admin difficulty setting ({settings?.pointsByDifficulty?.[draft.difficulty] ?? 10} points).
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Difficulty</Label>
                        <Input
                          list="diff-list"
                          value={draft.difficulty}
                          onChange={(e) => setDraft({
                            ...draft,
                            difficulty: e.target.value,
                            points: draft.pointsOverride ? draft.points : settings?.pointsByDifficulty?.[e.target.value] ?? draft.points,
                          })}
                        />
                        <datalist id="diff-list">{DIFFICULTIES.map((d) => <option key={d} value={d} />)}</datalist>
                      </div>
                      <div>
                        <Label>Topic</Label>
                        <Input list="topic-list" value={draft.topic} onChange={(e) => setDraft({ ...draft, topic: e.target.value })} />
                        <datalist id="topic-list">{TOPICS.map((t) => <option key={t} value={t} />)}</datalist>
                      </div>
                    </div>

                    {isMC && (
                      <div>
                        <Label>Options</Label>
                        <div className="space-y-2">
                          {draft.options.map((opt, i) => (
                            <div key={opt.id} className="flex items-center gap-2">
                              <Input
                                value={opt.text}
                                onChange={(e) => {
                                  const opts = [...draft.options]
                                  opts[i].text = e.target.value
                                  setDraft({ ...draft, options: opts })
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const opts = [...draft.options]
                                  opts.splice(i, 1)
                                  setDraft({ ...draft, options: opts })
                                  if (draft.correctAnswer === String(i)) setDraft({ ...draft, correctAnswer: "" })
                                }}
                                className="btn-icon p-1 text-red-400 hover:text-red-600"
                                aria-label="Remove option"
                              >
                                <Trash2 size={16} strokeWidth={2} />
                              </button>
                              <button
                                type="button"
                                onClick={() => { if (i > 0) { const opts = [...draft.options]; [opts[i-1], opts[i]] = [opts[i], opts[i-1]]; setDraft({ ...draft, options: opts }) } }}
                                className="btn-icon p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                disabled={i === 0}
                                aria-label="Move up"
                              >
                                <ArrowUp size={14} strokeWidth={2} />
                              </button>
                              <button
                                type="button"
                                onClick={() => { if (i < draft.options.length - 1) { const opts = [...draft.options]; [opts[i+1], opts[i]] = [opts[i], opts[i+1]]; setDraft({ ...draft, options: opts }) } }}
                                className="btn-icon p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                disabled={i === draft.options.length - 1}
                                aria-label="Move down"
                              >
                                <ArrowDown size={14} strokeWidth={2} />
                              </button>
                              <label className="flex items-center gap-2 cursor-pointer flex-1">
                                <input
                                  type="radio"
                                  checked={draft.correctAnswer === String(i)}
                                  onChange={() => setDraft({ ...draft, correctAnswer: String(i) })}
                                  className="text-indigo-500"
                                />
                                {String.fromCharCode(65 + i)}
                              </label>
                            </div>
                          ))}
                          <Button variant="ghost" size="sm" onClick={() => {
                            const opts = [...draft.options, { id: `opt-${Date.now()}`, text: "" }]
                            setDraft({ ...draft, options: opts })
                          }} className="w-full justify-center">
                            <Plus size={16} className="mr-2" /> Add option
                          </Button>
                        </div>
                      </div>
                    )}

                    {isID && (
                      <div>
                        <Label>Accepted answers (case-insensitive)</Label>
                        <div className="space-y-2">
                          {draft.acceptedAnswers.map((ans, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Input value={ans} onChange={(e) => {
                                const a = [...draft.acceptedAnswers]; a[i] = e.target.value; setDraft({ ...draft, acceptedAnswers: a })
                              }} />
                              <button type="button" onClick={() => { const a = [...draft.acceptedAnswers]; a.splice(i, 1); setDraft({ ...draft, acceptedAnswers: a }) }} className="btn-icon p-1 text-red-400 hover:text-red-600"><Trash2 size={14} strokeWidth={2} /></button>
                            </div>
                          ))}
                          <Button variant="ghost" size="sm" onClick={() => setDraft({ ...draft, acceptedAnswers: [...draft.acceptedAnswers, ""] })} className="w-full justify-center">
                            <Plus size={16} className="mr-1" /> Add accepted variation
                          </Button>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">Separate variations like "PPE", "personal protective equipment".</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label>Explanation (shown after answering)</Label>
                      <Textarea value={draft.explanation} onChange={(e) => setDraft({ ...draft, explanation: e.target.value })} rows={2} placeholder="Why is this answer correct?" />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Button variant="outline" size="sm" onClick={() => { setDraft(null); setSelectedId(null) }}>Cancel</Button>
                      <Button variant="primary" size="sm" onClick={handleSave} className="px-4">
                        <Save size={16} className="mr-2" /> Save question
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Live preview</h3>
                  <Badge variant="indigo" className="text-[10px]">Student view</Badge>
                </div>
                <Card className="flex-1 min-h-[300px] p-0 overflow-hidden">
                  {draft ? (
                    <div className="p-6">
                      <QuestionCard
                        question={{
                          ...draft,
                          id: draft.id || "preview",
                          options: draft.options.map((o, i) => ({ ...o, id: `prev-${i}` })),
                          correctAnswer: draft.correctAnswer,
                        }}
                        currentIndex={1}
                        total={1}
                        onAnswer={(ans) => {
                          const q = { ...draft }
                          const isMC = q.type === QUESTION_TYPES.MULTIPLE_CHOICE
                          const correct = q.type === QUESTION_TYPES.IDENTIFICATION
                            ? q.acceptedAnswers.some((a) => a.trim().toLowerCase() === String(ans.answer).trim().toLowerCase())
                            : q.correctAnswer === String(ans.answer)
                          const correctText = isMC
                            ? (q.options[Number(q.correctAnswer)]?.text || q.correctAnswer)
                            : q.acceptedAnswers[0] || q.correctAnswer
                          setPreviewResult({ correct, answer: ans.answer, correctAnswer: correctText })
                          setPreviewSubmitted(true)
                        }}
                        disabled={previewSubmitted}
                      />
                      {previewSubmitted && (
                        <div className="mt-4 px-6 py-4 rounded-card border" style={{
                          backgroundColor: previewResult.correct ? "rgba(45, 212, 167, 0.10)" : "rgba(255, 107, 107, 0.10)",
                          borderColor: previewResult.correct ? "rgba(45, 212, 167, 0.35)" : "rgba(255, 107, 107, 0.35)",
                        }}>
                          <p className={cn("font-semibold", previewResult.correct ? "text-emerald-800 dark:text-emerald-400" : "text-red-800 dark:text-red-400")}>
                            {previewResult.correct ? "Correct!" : `Incorrect. Correct answer: ${previewResult.correctAnswer}`}
                          </p>
                          <Button variant="ghost" size="sm" onClick={() => { setPreviewSubmitted(false); setPreviewResult(null) }}>Try again</Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
                      <HelpCircle size={24} className="mb-2" />
                      <p>Select or create a question to preview</p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <FileText size={48} className="text-gray-400 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">No question selected</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Create a new question or select one from the bank to edit.</p>
            <Button variant="primary" onClick={startNew} className="px-6">
              <Plus size={18} className="mr-2" /> Create new question
            </Button>
          </div>
        )}
      </div>

      <Modal isOpen={bulkOpen} onClose={() => setBulkOpen(false)} title="Import questions">
        <div className="p-4">
          <div className="mb-5">
            <Label htmlFor="questionnaire-json-file">Replace question bank from JSON</Label>
            <input
              id="questionnaire-json-file"
              type="file"
              accept=".json,application/json"
              onChange={handleJsonImport}
              className="block w-full text-sm text-gray-600 dark:text-gray-300 file:mr-3 file:rounded-button file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:font-medium file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-300"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              The file must contain a questions array with multiple-choice options and a correct answer.
            </p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Or paste CSV with header: text,type,options|separated,correctAnswer,acceptedAnswers|separated,explanation,points,difficulty,topic</p>
          <Textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} rows={8} placeholder="text,type,options|separated,correctAnswer,acceptedAnswers|separated,explanation,points,difficulty,topic" />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setBulkOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleBulkImport}>Import</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
