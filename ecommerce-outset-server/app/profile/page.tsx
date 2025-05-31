import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import ProfileForm from '@/components/profile/ProfileForm';

// TODO: Replace this placeholder with the real ProfileForm implementation
const PlaceholderProfileForm: React.FC = () => {
  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-lg font-semibold">Profile Form Placeholder</h2>
      <p>This is a placeholder for the real ProfileForm component.</p>
    </div>
  );
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <div className="mt-6">
            <ProfileForm user={session.user} />
          </div>
        </div>
      </div>
    </div>
  );
} 