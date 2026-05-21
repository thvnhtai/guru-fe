'use client'

import { useState } from 'react'
import { useUserStore } from '@/stores/userStore'

interface SolutionFormProps {
  onSubmit: (code: string, language: string, explanation?: string) => Promise<void>
  onCancel?: () => void
}

const LANGUAGES = ['python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'go', 'rust']

export function SolutionForm({ onSubmit, onCancel }: SolutionFormProps) {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [explanation, setExplanation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const user = useUserStore((state) => state.user)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      setError('Code cannot be empty')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await onSubmit(code, language, explanation || undefined)
      setCode('')
      setExplanation('')
      setLanguage('python')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share solution')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-700">Sign in to share solutions</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="font-semibold">Share Your Solution</h3>

      {/* Language selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Language
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Code editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Code
        </label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code here..."
          className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={10}
        />
      </div>

      {/* Explanation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Explanation (Optional)
        </label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Explain your approach, time complexity, space complexity..."
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Buttons */}
      <div className="flex gap-2 justify-end pt-2 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm font-medium"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !code.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sharing...' : 'Share Solution'}
        </button>
      </div>
    </form>
  )
}
