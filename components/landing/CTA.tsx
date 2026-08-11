import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function CTA() {
  return (
    <section className="bg-indigo-900 py-16 sm:py-24 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8 relative">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Build Your Career Roadmap Today
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-md text-indigo-100">
          Get isolated metrics tracking, structured skill checks, and agentic profile evaluations instantly.
        </p>
        <div className="mt-8 flex justify-center">
          <Link href="/signup">
            <Button size="lg" className="bg-white text-indigo-900 hover:bg-slate-50 font-bold">
              Build My Roadmap
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
