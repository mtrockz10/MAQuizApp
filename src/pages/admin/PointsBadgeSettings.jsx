import { useEffect, useState } from "react"
import { useQuiz } from "../../context/QuizContext"
import { useToast } from "../../context/ToastContext"
import { badgeService, settingsService } from "../../services/api"
import { Star, Flame, Badge as LucideBadge, SlidersHorizontal, ShieldCheck, Plus, Trash2 } from "lucide-react"
import { Card } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Label } from "../../components/ui/Label"

const DIFFICULTIES = ["Easy", "Medium", "Hard"]
const BADGE_TYPES = ["bronze", "silver", "gold", "platinum"]
const BADGE_RULES = [
  { value: "first_quiz", label: "Complete a number of quizzes" },
  { value: "streak", label: "Reach a day streak" },
  { value: "perfect_score", label: "Score at least a percentage" },
  { value: "top_10", label: "Reach a leaderboard rank" },
  { value: "quiz_master", label: "Complete all quizzes" },
  { value: "topic", label: "Complete a quiz in a topic" },
]

const fallbackRule = {
  "badge-first-quiz": "first_quiz",
  "badge-streak-5": "streak",
  "badge-perfect": "perfect_score",
  "badge-top-10": "top_10",
  "badge-quiz-master": "quiz_master",
  "badge-communicator": "topic",
}

function normalizedBadge(badge) {
  const rule = badge.rule || fallbackRule[badge.id] || "first_quiz"
  const defaultThreshold = rule === "streak" ? 5 : rule === "perfect_score" ? 100 : rule === "top_10" ? 10 : 1
  return {
    ...badge,
    rule,
    threshold: Number(badge.threshold) || defaultThreshold,
    topic: badge.topic || (badge.id === "badge-communicator" ? "Communication" : ""),
  }
}

export default function PointsBadgeSettings() {
  const { badges, settings, refresh } = useQuiz()
  const toast = useToast()
  const [points, setPoints] = useState({ Easy: 10, Medium: 20, Hard: 30 })
  const [streakThreshold, setStreakThreshold] = useState(3)
  const [streakMultiplier, setStreakMultiplier] = useState(2)
  const [badgeDrafts, setBadgeDrafts] = useState([])
  const [deletedBadgeIds, setDeletedBadgeIds] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (settings) {
      setPoints({ Easy: 10, Medium: 20, Hard: 30, ...settings.pointsByDifficulty })
      setStreakThreshold(settings.streakThreshold)
      setStreakMultiplier(settings.streakMultiplier)
    }
  }, [settings])

  useEffect(() => {
    setBadgeDrafts(badges.map(normalizedBadge))
  }, [badges])

  const updateBadge = (id, updates) => {
    setBadgeDrafts((current) => current.map((badge) => badge.id === id ? { ...badge, ...updates } : badge))
  }

  const addBadge = () => {
    setBadgeDrafts((current) => [
      ...current,
      {
        id: `new-${Date.now()}`,
        name: "",
        description: "",
        icon: "🏅",
        criterion: "",
        type: "bronze",
        rule: "first_quiz",
        threshold: 1,
        topic: "",
      },
    ])
  }

  const removeBadge = (badge) => {
    setBadgeDrafts((current) => current.filter((item) => item.id !== badge.id))
    if (!badge.id.startsWith("new-")) {
      setDeletedBadgeIds((current) => [...current, badge.id])
    }
  }

  const handleSave = () => {
    if (Object.values(points).some((value) => !Number.isInteger(value) || value < 0)) {
      toast.error("Points must be whole numbers greater than or equal to zero.")
      return
    }
    if (!Number.isInteger(streakThreshold) || streakThreshold < 1 ||
        !Number.isFinite(streakMultiplier) || streakMultiplier < 1) {
      toast.error("Streak threshold must be at least 1 day and the multiplier must be at least 1.")
      return
    }
    if (badgeDrafts.some((badge) =>
      !badge.name.trim() ||
      !badge.criterion.trim() ||
      !BADGE_RULES.some((rule) => rule.value === badge.rule) ||
      !Number.isInteger(Number(badge.threshold)) ||
      Number(badge.threshold) < 1 ||
      (badge.rule === "topic" && !badge.topic.trim())
    )) {
      toast.error("Complete each badge name, criterion, and valid unlock requirement before saving.")
      return
    }

    setSaving(true)
    try {
      settingsService.update({
        pointsByDifficulty: points,
        streakThreshold,
        streakMultiplier,
      })
      deletedBadgeIds.forEach((id) => badgeService.delete(id))
      badgeDrafts.forEach((badge) => {
        const { id, ...data } = badge
        const payload = {
          ...data,
          threshold: Number(data.threshold),
          topic: data.rule === "topic" ? data.topic.trim() : "",
        }
        if (id.startsWith("new-")) badgeService.create(payload)
        else badgeService.update(id, payload)
      })
      setDeletedBadgeIds([])
      refresh()
      toast.success("Points, streak rules, and badge criteria saved.")
    } catch (error) {
      toast.error(error.message || "Settings could not be saved.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold heading text-gray-900 dark:text-white">Points &amp; badge settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configure scoring, streak bonuses, and badge criteria.</p>
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={20} className="text-indigo-500 dark:text-indigo-400 mr-2" />
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Admin configuration</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-bold heading text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Star size={20} strokeWidth={2} className="text-amber-500" />
              Points per difficulty
            </h2>
            <div className="space-y-4">
              {DIFFICULTIES.map((difficulty) => (
                <div key={difficulty} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-card border border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{difficulty}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Points per correct answer</p>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={points[difficulty]}
                    onChange={(event) => setPoints({ ...points, [difficulty]: Number(event.target.value) })}
                    className="w-24"
                    aria-label={`${difficulty} points`}
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-bold heading text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Flame size={20} strokeWidth={2} className="text-amber-500" />
              Streak bonus rules
            </h2>
            <div className="space-y-4">
              <div>
                <Label>Streak bonus threshold (days)</Label>
                <Input type="number" min="1" step="1" value={streakThreshold} onChange={(event) => setStreakThreshold(Number(event.target.value))} />
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Award the multiplier after this many consecutive days.</p>
              </div>
              <div>
                <Label>Streak bonus multiplier</Label>
                <Input type="number" min="1" step="0.1" value={streakMultiplier} onChange={(event) => setStreakMultiplier(Number(event.target.value))} />
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Points multiplier when the streak threshold is met.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-lg font-bold heading text-gray-900 dark:text-white flex items-center gap-2">
              <LucideBadge size={20} strokeWidth={2} className="text-amber-500" />
              Badge criteria
            </h2>
            <Button variant="secondary" size="sm" onClick={addBadge}>
              <Plus size={16} /> Add badge
            </Button>
          </div>
          <div className="space-y-4">
            {badgeDrafts.map((badge) => (
              <div key={badge.id} className="grid gap-3 rounded-card border border-gray-200 dark:border-gray-700 p-4 md:grid-cols-2 xl:grid-cols-6">
                <div>
                  <Label>Badge name</Label>
                  <Input value={badge.name} onChange={(event) => updateBadge(badge.id, { name: event.target.value })} />
                </div>
                <div>
                  <Label>Icon</Label>
                  <Input value={badge.icon} onChange={(event) => updateBadge(badge.id, { icon: event.target.value })} />
                </div>
                <div>
                  <Label>Tier</Label>
                  <select className="input py-3" value={badge.type} onChange={(event) => updateBadge(badge.id, { type: event.target.value })}>
                    {BADGE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label>Unlock requirement</Label>
                  <select
                    className="input py-3"
                    value={badge.rule}
                    onChange={(event) => updateBadge(badge.id, { rule: event.target.value })}
                  >
                    {BADGE_RULES.map((rule) => <option key={rule.value} value={rule.value}>{rule.label}</option>)}
                  </select>
                </div>
                {badge.rule !== "quiz_master" && (
                  <div>
                    <Label>{badge.rule === "streak" ? "Days" : badge.rule === "perfect_score" ? "Score (%)" : badge.rule === "top_10" ? "Rank" : "Quiz count"}</Label>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={badge.threshold}
                      onChange={(event) => updateBadge(badge.id, { threshold: Number(event.target.value) })}
                    />
                  </div>
                )}
                {badge.rule === "topic" && (
                  <div>
                    <Label>Topic</Label>
                    <Input value={badge.topic} onChange={(event) => updateBadge(badge.id, { topic: event.target.value })} />
                  </div>
                )}
                <div className="md:col-span-2 xl:col-span-3">
                  <Label>Student-facing criterion</Label>
                  <Input value={badge.criterion} onChange={(event) => updateBadge(badge.id, { criterion: event.target.value })} />
                </div>
                <div className="md:col-span-2 xl:col-span-2">
                  <Label>Description</Label>
                  <Input value={badge.description || ""} onChange={(event) => updateBadge(badge.id, { description: event.target.value })} />
                </div>
                <div className="flex items-end justify-between gap-2">
                  <Badge variant={badge.type === "gold" ? "amber" : badge.type === "silver" ? "gray" : "indigo"} className="text-[10px] uppercase">
                    {badge.type}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => removeBadge(badge)} aria-label={`Remove ${badge.name || "badge"}`}>
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            {badgeDrafts.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No badges configured. Add a badge to get started.</p>
            )}
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-4">Updated badge rules are evaluated when a student submits a quiz.</p>
        </div>
      </Card>

      <div className="flex justify-end pt-2">
        <Button variant="primary" onClick={handleSave} disabled={saving} className="px-6">
          <ShieldCheck size={18} /> {saving ? "Saving..." : "Save settings"}
        </Button>
      </div>
    </div>
  )
}
