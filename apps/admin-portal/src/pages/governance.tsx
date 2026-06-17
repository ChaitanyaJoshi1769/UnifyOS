import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BookOpen, Users, Lock } from 'lucide-react';

export default function Governance() {
  const [catalogStats] = useState({
    totalAssets: 2847,
    documented: 2156,
    ownership: 1923,
    stewardship: 1654,
  });

  return (
    <>
      <Head>
        <title>Governance - UnifyOS Admin</title>
      </Head>
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Governance</h1>
            <p className="mt-2 text-gray-600">Data catalog, business glossary, and policies</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Catalog Assets</p>
                    <p className="text-3xl font-bold text-gray-900">{catalogStats.totalAssets}</p>
                  </div>
                  <BookOpen className="w-10 h-10 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Documented</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {((catalogStats.documented / catalogStats.totalAssets) * 100).toFixed(0)}%
                    </p>
                  </div>
                  <BookOpen className="w-10 h-10 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Data Owners</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {((catalogStats.ownership / catalogStats.totalAssets) * 100).toFixed(0)}%
                    </p>
                  </div>
                  <Users className="w-10 h-10 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Data Stewards</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {((catalogStats.stewardship / catalogStats.totalAssets) * 100).toFixed(0)}%
                    </p>
                  </div>
                  <Lock className="w-10 h-10 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Data Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-semibold text-gray-900">PII Protection Policy</h3>
                  <p className="text-sm text-gray-600 mt-1">Restrict access to personally identifiable information</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Active</span>
                    <span className="text-xs text-gray-500">12 assets affected</span>
                  </div>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-semibold text-gray-900">Data Retention Policy</h3>
                  <p className="text-sm text-gray-600 mt-1">Automatically archive data older than 2 years</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Active</span>
                    <span className="text-xs text-gray-500">847 assets affected</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </>
  );
}
