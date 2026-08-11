import { Shield, Target, Cpu, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

const features = [
  {
    name: 'AI Career Analysis',
    description: 'Sequenced Multi-Agent pipeline analyzes background parameters, interests, and matching guidelines.',
    icon: Cpu,
  },
  {
    name: 'RAG Knowledge Retrieval',
    description: 'Pulls factual skill, database, framework requirements directly from target guides rather than hallucinations.',
    icon: Target,
  },
  {
    name: 'Custom Roadmaps',
    description: 'Receive sequential learning checkpoints structured precisely based on identified priority skill gaps.',
    icon: TrendingUp,
  },
  {
    name: 'Isolated Privacy',
    description: 'Isolated workspace databases with Row Level Security protecting individual profiles.',
    icon: Shield,
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 sm:py-24 bg-white relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Platform Features</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Why Career PathFinder?
          </p>
          <p className="mt-4 text-base text-slate-500">
            A state of the art analysis network mapping custom guidance based on live market metrics.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl sm:mt-20">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {features.map((feature) => (
              <Card key={feature.name} className="hover:-translate-y-1 transform transition-all duration-300">
                <CardContent className="flex gap-4 p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-950">{feature.name}</h3>
                    <p className="mt-2 text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
