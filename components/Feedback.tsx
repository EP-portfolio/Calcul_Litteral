interface FeedbackProps {
  isCorrect: boolean
  correctAnswer: string
  explanation?: string[]
}

export default function Feedback({ isCorrect, correctAnswer, explanation }: FeedbackProps) {
  return (
    <div
      className={`p-4 rounded-lg border-2 ${
        isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {isCorrect ? (
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>

        <div className="ml-3 flex-1">
          <h3 className={`text-lg font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
            {isCorrect ? 'Bravo ! Réponse correcte !' : 'Réponse incorrecte'}
          </h3>

          {!isCorrect && (
            <div className="mt-2">
              <p className="text-sm text-gray-700">
                La bonne réponse est :{' '}
                <span
                  className="font-mono font-semibold text-lg"
                  role="math"
                  aria-label={`Réponse correcte : ${correctAnswer}`}
                >
                  {correctAnswer}
                </span>
              </p>
            </div>
          )}

          {explanation && explanation.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Explication :</p>
              <ol className="list-decimal list-inside space-y-1">
                {explanation.map((step, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
