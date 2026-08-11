'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getProfile, updateProfile } from '@/lib/supabase/queries';
import { UserProfile } from '@/types/career';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        getProfile(user.id).then(res => {
          if (res) {
            setProfile(res);
            setFullName(res.full_name || '');
            setTargetRole(res.target_role || '');
            setCareerGoal(res.career_goal || '');
          }
          setLoading(false);
        });
      }
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    setMessage('');

    try {
      await updateProfile(profile.id, {
        full_name: fullName,
        target_role: targetRole,
        career_goal: careerGoal
      });
      setMessage('Profile updated successfully.');
    } catch (err: any) {
      setMessage(err.message || 'Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Profile Details</h1>
        <p className="text-slate-500 mt-1">Manage personal parameters and matching targets.</p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Keep your profile configuration updated</CardDescription>
        </CardHeader>

        <form onSubmit={handleSave}>
          <CardContent className="space-y-4">
            {message && (
              <div className="p-3 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg">
                {message}
              </div>
            )}

            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isSaving}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-sm">
                {profile?.email}
              </div>
            </div>

            <Input
              label="Target Career"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              disabled={isSaving}
            />

            <Input
              label="Primary Goal"
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
              disabled={isSaving}
            />
          </CardContent>

          <CardFooter>
            <Button type="submit" isLoading={isSaving}>Save Updates</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
