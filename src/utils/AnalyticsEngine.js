// src/utils/Analyticsengine.js
import { categorizeThought, getMoodScore } from './AiSuggestions'

export function analyzeThoughts(thoughts, options = {}) {
  const {
    sessions = 1,
    includeTimeline = true,
    includeMoodAnalysis = true,
  } = options

  if (!thoughts || thoughts.length === 0) {
    return getEmptyAnalytics()
  }

  return {
    totalThoughts: thoughts.length,
    avgThoughtsPerSession:
      sessions > 0
        ? parseFloat((thoughts.length / sessions).toFixed(1))
        : thoughts.length,
    categoryBreakdown: getCategoryBreakdown(thoughts),
    ...(includeMoodAnalysis && {
      moodTrend: getMoodTrend(thoughts),
      averageMood: getAverageMood(thoughts),
      moodDistribution: getMoodDistribution(thoughts),
    }),
    zoneDistribution: getZoneDistribution(thoughts),
    activityHeatmap: getActivityHeatmap(thoughts),
    topThemes: getTopThemes(thoughts),
    connectionCount: countConnections(thoughts),
    ...(includeTimeline && {
      timeline: getTimeline(thoughts),
    }),
    insights: generateInsights(thoughts),
  }
}

function getEmptyAnalytics() {
  return {
    totalThoughts: 0,
    avgThoughtsPerSession: 0,
    categoryBreakdown: {},
    moodTrend: [],
    averageMood: 50,
    moodDistribution: { positive: 0, neutral: 0, negative: 0 },
    zoneDistribution: {},
    activityHeatmap: Array(7).fill(0),
    topThemes: [],
    connectionCount: 0,
    timeline: [],
    insights: ['Add some thoughts to see analytics!'],
  }
}

export function getCategoryBreakdown(thoughts) {
  const breakdown = {}

  thoughts.forEach((thought) => {
    const categories = categorizeThought(thought.text)
    categories.forEach((category) => {
      breakdown[category] = (breakdown[category] || 0) + 1
    })
  })

  return breakdown
}

export function getMoodTrend(thoughts, count = 10) {
  const recentThoughts = thoughts.slice(-count)
  return recentThoughts.map((t) => getMoodScore(t.text))
}

export function getAverageMood(thoughts) {
  if (thoughts.length === 0) return 50

  const total = thoughts.reduce((sum, t) => sum + getMoodScore(t.text), 0)
  return Math.round(total / thoughts.length)
}

export function getMoodDistribution(thoughts) {
  if (thoughts.length === 0) {
    return { positive: 0, neutral: 0, negative: 0 }
  }

  let positive = 0
  let neutral = 0
  let negative = 0

  thoughts.forEach((t) => {
    const score = getMoodScore(t.text)
    if (score >= 60) positive++
    else if (score <= 40) negative++
    else neutral++
  })

  const total = thoughts.length
  return {
    positive: Math.round((positive / total) * 100),
    neutral: Math.round((neutral / total) * 100),
    negative: Math.round((negative / total) * 100),
  }
}

export function getZoneDistribution(thoughts) {
  const distribution = {
    creative: 0,
    focus: 0,
    organize: 0,
    relax: 0,
    floating: 0,
  }

  thoughts.forEach((t) => {
    if (t.zone && Object.prototype.hasOwnProperty.call(distribution, t.zone)) {
      distribution[t.zone]++
    } else {
      distribution.floating++
    }
  })

  return distribution
}

export function getActivityHeatmap(thoughts) {
  const heatmap = Array(7).fill(0)

  thoughts.forEach((thought, index) => {
    if (thought.createdAt) {
      const day = new Date(thought.createdAt).getDay()
      heatmap[day]++
    } else {
      heatmap[index % 7]++
    }
  })

  return heatmap
}

export function getTopThemes(thoughts, count = 3) {
  const breakdown = getCategoryBreakdown(thoughts)

  return Object.entries(breakdown)
    .filter(([category]) => category !== 'general')
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([category]) => category)
}

export function countConnections(thoughts) {
  let connections = 0

  for (let i = 0; i < thoughts.length; i++) {
    for (let j = i + 1; j < thoughts.length; j++) {
      const categories1 = categorizeThought(thoughts[i].text)
      const categories2 = categorizeThought(thoughts[j].text)
      const shared = categories1.filter(
        (c) => categories2.includes(c) && c !== 'general',
      )
      if (shared.length > 0) connections++
    }
  }

  return connections
}

export function getTimeline(thoughts) {
  return thoughts
    .filter((t) => t.createdAt)
    .map((t) => ({
      text: t.text,
      time: new Date(t.createdAt).toLocaleString(),
      mood: getMoodScore(t.text),
      category: categorizeThought(t.text)[0],
    }))
    .slice(-20)
}

export function generateInsights(thoughts) {
  const insights = []

  if (thoughts.length === 0) {
    return ['Start adding thoughts to unlock insights!']
  }

  const avgMood = getAverageMood(thoughts)
  if (avgMood >= 70) {
    insights.push(
      '🌟 Your thoughts are predominantly positive! Keep that energy flowing.',
    )
  } else if (avgMood >= 50) {
    insights.push('⚖️ Your mood balance is healthy with a mix of emotions.')
  } else {
    insights.push(
      '💙 Consider adding some gratitude or positive intentions to lift your spirits.',
    )
  }

  const topThemes = getTopThemes(thoughts, 2)
  if (topThemes.length > 0) {
    insights.push(`🎯 Your mind is focused on: ${topThemes.join(' & ')}`)
  }

  const zoneDistribution = getZoneDistribution(thoughts)
  const mostUsedZone = Object.entries(zoneDistribution)
    .filter(([zone]) => zone !== 'floating')
    .sort((a, b) => b[1] - a[1])[0]

  if (mostUsedZone && mostUsedZone[1] > 0) {
    const zoneMessages = {
      creative: "🎨 You're in a creative flow! Keep exploring.",
      focus: "🎯 Strong focus energy - you're getting things done.",
      organize: '📊 Organization mode active - bringing order to chaos.',
      relax: '🌙 Taking time to relax - self-care is important.',
    }
    insights.push(zoneMessages[mostUsedZone[0]] || '')
  }

  if (thoughts.length >= 10) {
    insights.push(
      `📝 You've captured ${thoughts.length} thoughts - great reflection habit!`,
    )
  } else if (thoughts.length >= 5) {
    insights.push('📝 Good start! Keep capturing your thoughts.')
  }

  const moodTrend = getMoodTrend(thoughts, 5)
  if (moodTrend.length >= 3) {
    const isImproving = moodTrend[moodTrend.length - 1] > moodTrend[0]
    if (isImproving) {
      insights.push("📈 Your mood is trending upward - something's working!")
    }
  }

  const breakdown = getCategoryBreakdown(thoughts)
  const hasWork = (breakdown.work || 0) > 0
  const hasWellness = (breakdown.wellness || 0) > 0

  if (hasWork && !hasWellness) {
    insights.push(
      '💡 Tip: Balance work thoughts with some wellness intentions.',
    )
  }

  return insights.filter((i) => i.length > 0).slice(0, 4)
}
