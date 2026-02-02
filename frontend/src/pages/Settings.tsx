import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your account and preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <SettingsIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Coming Soon</h3>
              <p className="mt-2 text-sm text-gray-500">
                Settings page will be available in a future phase
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
