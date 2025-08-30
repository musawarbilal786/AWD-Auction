interface Step {
  id: number
  title: string
  subtitle: string
}

interface ProgressIndicatorProps {
  steps: Step[]
  currentStep: number
}

export function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
  return (
    <div className="flex justify-center mt-8">
      <div className="flex space-x-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`h-2 rounded-full transition-all duration-300 ${
              index + 1 === currentStep
                ? "w-8 sm:w-10 md:w-14 lg:w-24 bg-sky-600"
                : index + 1 < currentStep
                  ? "w-8 sm:w-10 md:w-14 lg:w-24 bg-sky-600"
                  : "w-8 sm:w-10 md:w-14 lg:w-24 bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  )
} 