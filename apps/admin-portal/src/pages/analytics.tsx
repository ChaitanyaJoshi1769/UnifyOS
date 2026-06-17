import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TrendingUp, Server, Database } from 'lucide-react';

export default function Analytics() {
  const [metrics] = useState([
    { label: 'Documents Indexed', value: '2.3M', change: '+12%' },
    { label: 'Search Queries', value: '847K', change: '+8%' },
    { label: 'API Calls', value: '12.5M', change: '+22%' },
    { label: 'Storage Used', value: '2.1TB', change: '+18%' },
  ]);

  return (
    <>
      <Head>
        <title>Analytics - UnifyOS Admin</title>
      </Head>
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Analytics</h1>
            <p className="mt-2 text-gray-600">System metrics and performance insights</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric) => (
              <Card key={metric.label}>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">{metric.label}</p>
                  <div className="mt-2 flex items-end justify-between">
                    <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                    <p className="text-sm text-green-600 font-medium">{metric.change}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Service Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-3">
                    <Server className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">API Gateway</p>
                      <p className="text-sm text-gray-600">Avg response: 45ms</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">99.9%</p>
                    <p className="text-xs text-gray-600">Uptime</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Search Service</p>
                      <p className="text-sm text-gray-600">Avg response: 80ms</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">99.8%</p>
                    <p className="text-xs text-gray-600">Uptime</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Knowledge Graph</p>
                      <p className="text-sm text-gray-600">Avg response: 150ms</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">99.6%</p>
                    <p className="text-xs text-gray-600">Uptime</p>
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
