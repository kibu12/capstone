'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Fetch assessment state to determine onboarding vs dashboard redirect
        const { data: assessments, error: dbError } = await supabase
          .from('assessments')
          .select('id')
          .eq('user_id', data.user.id)
          .limit(1);

        if (assessments && assessments.length > 0) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-slate-100 shadow-xl bg-white">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
            CP
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Sign in to your account</CardTitle>
        <CardDescription className="text-center">
          Access your personalized career roadmap
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-100 rounded-lg">
              {error}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign In
          </Button>
          <div className="text-xs text-center text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-indigo-600 font-semibold hover:underline">
              Sign Up
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
