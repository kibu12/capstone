const steps = [
  {
    id: 1,
    title: 'Complete Profile Assessment',
    description: 'Provide details about your current skills, experience background, and target career ambitions.'
  },
  {
    id: 2,
    title: 'Multi-Agent Processing',
    description: 'Specialized agents execute sequential research, gap calculations, and roadmap planning.'
  },
  {
    id: 3,
    title: 'Contextual RAG Retrieval',
    description: 'Factual parameters are retrieved from the knowledge database guides to secure accurate matching scores.'
  },
  {
    id: 4,
    title: 'Dashboard Tracking',
    description: 'Manage and update learning checkpoints, check development score, and test project challenges.'
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-24 bg-slate-50 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Methodology</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            How it works
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step) => (
            <div key={step.id} className="relative flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-lg shadow-md mb-4">
                0{step.id}
              </div>
              <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed px-2">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
