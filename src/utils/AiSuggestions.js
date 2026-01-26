// src/utils/aiSuggestions.js

export const THOUGHT_CATEGORIES = {
  emotions: [
    'happy',
    'sad',
    'angry',
    'peaceful',
    'anxious',
    'calm',
    'excited',
    'tired',
    'love',
    'fear',
    'joy',
    'hope',
    'frustrated',
    'grateful',
    'lonely',
    'content',
  ],
  creativity: [
    'idea',
    'dream',
    'imagine',
    'create',
    'art',
    'music',
    'write',
    'design',
    'inspire',
    'vision',
    'innovate',
    'explore',
    'experiment',
    'invent',
    'compose',
  ],
  work: [
    'project',
    'deadline',
    'meeting',
    'task',
    'goal',
    'focus',
    'productivity',
    'schedule',
    'team',
    'review',
    'plan',
    'strategy',
    'client',
    'presentation',
    'email',
  ],
  wellness: [
    'exercise',
    'meditate',
    'sleep',
    'health',
    'relax',
    'breathe',
    'nature',
    'balance',
    'rest',
    'energy',
    'nutrition',
    'yoga',
    'mindful',
    'walk',
    'stretch',
  ],
  relationships: [
    'family',
    'friend',
    'connect',
    'talk',
    'listen',
    'support',
    'together',
    'share',
    'trust',
    'care',
    'partner',
    'children',
    'parent',
    'colleague',
    'community',
  ],
  growth: [
    'learn',
    'grow',
    'change',
    'improve',
    'challenge',
    'achieve',
    'progress',
    'develop',
    'evolve',
    'transform',
    'skill',
    'knowledge',
    'wisdom',
    'practice',
    'master',
  ],
}

const RELATED_SUGGESTIONS = {
  happy: [
    'gratitude',
    'celebrate',
    'joy',
    'smile',
    'contentment',
    'appreciate',
  ],
  sad: ['reflect', 'accept', 'heal', 'support', 'comfort', 'process'],
  angry: ['release', 'understand', 'communicate', 'breathe', 'forgive'],
  anxious: ['ground', 'breathe', 'present', 'accept', 'calm', 'reassure'],
  stressed: ['breathe', 'pause', 'simplify', 'release', 'ground', 'delegate'],
  tired: ['rest', 'recharge', 'boundaries', 'sleep', 'nourish', 'recover'],
  lonely: ['reach out', 'connect', 'community', 'share', 'belong'],
  work: ['prioritize', 'delegate', 'break', 'achieve', 'collaborate', 'focus'],
  project: ['milestone', 'deadline', 'team', 'plan', 'execute', 'review'],
  meeting: ['prepare', 'agenda', 'notes', 'action items', 'follow up'],
  deadline: ['prioritize', 'focus', 'plan', 'delegate', 'complete'],
  goal: ['plan', 'action', 'milestone', 'celebrate', 'adjust', 'visualize'],
  creative: ['explore', 'experiment', 'play', 'wonder', 'innovate', 'express'],
  idea: ['develop', 'test', 'share', 'refine', 'implement', 'brainstorm'],
  dream: ['visualize', 'plan', 'believe', 'pursue', 'manifest'],
  love: ['appreciate', 'express', 'nurture', 'cherish', 'connect', 'show'],
  family: ['quality time', 'support', 'communicate', 'traditions', 'memories'],
  friend: ['reach out', 'listen', 'support', 'adventure', 'share'],
  health: ['exercise', 'nutrition', 'sleep', 'checkup', 'hydrate', 'move'],
  exercise: ['consistency', 'variety', 'strength', 'cardio', 'flexibility'],
  meditate: ['breathe', 'focus', 'presence', 'peace', 'awareness'],
  sleep: ['routine', 'relax', 'unwind', 'rest', 'recover'],
  learn: ['practice', 'apply', 'teach', 'explore', 'curiosity', 'study'],
  grow: ['challenge', 'reflect', 'adapt', 'persist', 'evolve'],
  fear: ['courage', 'face', 'understand', 'release', 'transform', 'accept'],
  change: ['adapt', 'embrace', 'opportunity', 'growth', 'transition'],
  morning: ['routine', 'gratitude', 'intention', 'energy', 'breakfast'],
  evening: ['reflect', 'unwind', 'gratitude', 'prepare', 'rest'],
  weekend: ['recharge', 'adventure', 'family', 'hobbies', 'rest'],
}

const BALANCE_PAIRS = {
  work: 'rest',
  stress: 'calm',
  busy: 'pause',
  chaos: 'order',
  give: 'receive',
  talk: 'listen',
  active: 'rest',
  think: 'feel',
  plan: 'act',
  hold: 'release',
}

export function getAISuggestions(thoughts, options = {}) {
  const {
    maxSuggestions = 5,
    includeBalanceSuggestions = true,
    recentThoughtsCount = 5,
  } = options

  if (!thoughts || thoughts.length === 0) {
    return getStarterSuggestions()
  }

  const suggestions = new Set()
  const recentThoughts = thoughts.slice(-recentThoughtsCount)

  recentThoughts.forEach((thought) => {
    const text = thought.text.toLowerCase()

    Object.entries(RELATED_SUGGESTIONS).forEach(([key, values]) => {
      if (text.includes(key)) {
        const shuffled = [...values].sort(() => 0.5 - Math.random())
        shuffled.slice(0, 3).forEach((v) => suggestions.add(v))
      }
    })

    Object.values(THOUGHT_CATEGORIES).forEach((keywords) => {
      keywords.forEach((keyword) => {
        if (text.includes(keyword)) {
          const otherKeywords = keywords.filter((k) => k !== keyword)
          const randomPicks = otherKeywords
            .sort(() => 0.5 - Math.random())
            .slice(0, 2)
          randomPicks.forEach((p) => suggestions.add(p))
        }
      })
    })

    if (includeBalanceSuggestions) {
      Object.entries(BALANCE_PAIRS).forEach(([key, opposite]) => {
        if (text.includes(key)) {
          suggestions.add(opposite)
        }
      })
    }
  })

  const existingTexts = new Set(
    thoughts.map((t) => t.text.toLowerCase().trim()),
  )

  const filtered = Array.from(suggestions).filter(
    (s) => !existingTexts.has(s.toLowerCase()),
  )

  if (filtered.length < maxSuggestions) {
    const contextualSuggestions = getContextualSuggestions()
    contextualSuggestions.forEach((s) => {
      if (!existingTexts.has(s.toLowerCase()) && !filtered.includes(s)) {
        filtered.push(s)
      }
    })
  }

  return filtered.slice(0, maxSuggestions)
}

function getStarterSuggestions() {
  const starters = [
    'gratitude',
    'goals',
    'ideas',
    'reflect',
    'dream',
    'create',
    'connect',
    'grow',
    'peace',
    'energy',
  ]
  return starters.sort(() => 0.5 - Math.random()).slice(0, 5)
}

function getContextualSuggestions() {
  const suggestions = []
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 12) {
    suggestions.push('morning intention', 'energy', 'gratitude', 'plan today')
  } else if (hour >= 12 && hour < 17) {
    suggestions.push('focus', 'progress', 'break', 'nourish')
  } else if (hour >= 17 && hour < 21) {
    suggestions.push('reflect', 'unwind', 'connect', 'appreciate')
  } else {
    suggestions.push('rest', 'peaceful', 'tomorrow', 'dreams')
  }

  const day = new Date().getDay()
  if (day === 0 || day === 6) {
    suggestions.push('recharge', 'adventure', 'family time', 'hobbies')
  } else if (day === 1) {
    suggestions.push('fresh start', 'weekly goals', 'motivation')
  } else if (day === 5) {
    suggestions.push('celebrate wins', 'weekend plans', 'reflect on week')
  }

  return suggestions
}

export function categorizeThought(text) {
  const lowerText = text.toLowerCase()
  const categories = []

  Object.entries(THOUGHT_CATEGORIES).forEach(([category, keywords]) => {
    const hasMatch = keywords.some((keyword) => lowerText.includes(keyword))
    if (hasMatch) {
      categories.push(category)
    }
  })

  return categories.length > 0 ? categories : ['general']
}

export function getMoodScore(text) {
  const lowerText = text.toLowerCase()

  const positiveWords = [
    'happy',
    'joy',
    'love',
    'hope',
    'peace',
    'calm',
    'excited',
    'grateful',
    'content',
    'inspired',
    'proud',
    'confident',
    'energized',
    'optimistic',
    'blessed',
    'thankful',
  ]

  const negativeWords = [
    'sad',
    'angry',
    'fear',
    'anxious',
    'stress',
    'tired',
    'overwhelmed',
    'frustrated',
    'worried',
    'lonely',
    'hurt',
    'disappointed',
    'confused',
    'lost',
    'stuck',
  ]

  let score = 50

  positiveWords.forEach((word) => {
    if (lowerText.includes(word)) score += 8
  })

  negativeWords.forEach((word) => {
    if (lowerText.includes(word)) score -= 8
  })

  return Math.max(0, Math.min(100, score))
}

export function findThoughtConnections(thoughts) {
  const connections = []

  for (let i = 0; i < thoughts.length; i++) {
    for (let j = i + 1; j < thoughts.length; j++) {
      const t1 = thoughts[i]
      const t2 = thoughts[j]

      const categories1 = categorizeThought(t1.text)
      const categories2 = categorizeThought(t2.text)
      const sharedCategories = categories1.filter((c) =>
        categories2.includes(c),
      )

      if (sharedCategories.length > 0 && sharedCategories[0] !== 'general') {
        connections.push({
          from: i,
          to: j,
          reason: `shared category: ${sharedCategories[0]}`,
          strength: sharedCategories.length * 0.3,
        })
      }

      const text1 = t1.text.toLowerCase()
      const text2 = t2.text.toLowerCase()

      Object.entries(BALANCE_PAIRS).forEach(([word, opposite]) => {
        if (
          (text1.includes(word) && text2.includes(opposite)) ||
          (text1.includes(opposite) && text2.includes(word))
        ) {
          connections.push({
            from: i,
            to: j,
            reason: 'complementary pair',
            strength: 0.8,
            type: 'antonym',
          })
        }
      })
    }
  }

  return connections
}
