'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ActivityData {
  activity_date: string
  exercises_done: number
  correct_count: number
}

interface ChartProps {
  data: ActivityData[]
}

export function ActivityLineChart({ data }: ChartProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.activity_date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    }),
    Exercices: item.exercises_done,
    Réussis: item.correct_count,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="date"
          className="text-xs"
          tick={{ fill: 'currentColor' }}
          stroke="currentColor"
        />
        <YAxis className="text-xs" tick={{ fill: 'currentColor' }} stroke="currentColor" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="Exercices"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="Réussis"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ fill: '#10b981', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

interface CompetenceStat {
  competence: string
  success_rate: number
}

export function CompetenceBarChart({ data }: { data: CompetenceStat[] }) {
  const chartData = data.map((item) => ({
    Compétence: item.competence,
    'Taux de réussite': item.success_rate,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="Compétence"
          className="text-xs"
          tick={{ fill: 'currentColor' }}
          stroke="currentColor"
        />
        <YAxis
          className="text-xs"
          tick={{ fill: 'currentColor' }}
          stroke="currentColor"
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
          }}
          formatter={(value: number | undefined) =>
            value !== undefined ? [`${value.toFixed(1)}%`, 'Taux de réussite'] : ['', '']
          }
        />
        <Bar dataKey="Taux de réussite" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
