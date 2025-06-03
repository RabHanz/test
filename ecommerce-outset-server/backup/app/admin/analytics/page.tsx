import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminHeader from '@/components/admin/AdminHeader';

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  return (
    <div>
      <AdminHeader />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        {/* Add your analytics content here */}
      </div>
    </div>
  );
} 