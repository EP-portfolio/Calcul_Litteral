'use client'

interface MathInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  onSubmit?: () => void
  label: string
  placeholder?: string
}

export default function MathInput({
  value,
  onChange,
  disabled = false,
  onSubmit,
  label,
  placeholder,
}: MathInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit && !disabled) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor="math-input" className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">
        <input
          id="math-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full px-4 py-3 font-mono text-lg border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          aria-label={label}
          aria-describedby="input-hint"
        />
      </div>

      <p id="input-hint" className="text-sm text-gray-600">
        Utilisez ^ pour les exposants (ex: x^2 pour x²). Variables : x, y
      </p>

      {value && (
        <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200" aria-live="polite">
          <p className="text-sm text-gray-600 mb-1">Aperçu :</p>
          <p className="text-xl font-mono" role="math" aria-label={`Aperçu : ${value}`}>
            {value}
          </p>
        </div>
      )}
    </div>
  )
}
