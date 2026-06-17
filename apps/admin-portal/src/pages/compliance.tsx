import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TrendingUp } from 'lucide-react';

export default function Compliance() {
  const [frameworks] = useState([
    { name: 'GDPR', score: 92, status: 'compliant', requirements: 28 },
    { name: 'HIPAA', score: 88, status: 'partially-compliant', requirements: 35 },
    { name: 'SOC2', score: 95, status: 'compliant', requirements: 22 },
    { name: 'ISO 27001', score: 91, status: 'compliant', requirements: 114 },
  ]);

  return (
    <>
      <Head>
        <title>Compliance - UnifyOS Admin</title>
      </Head>
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Compliance</h1>
            <p className="mt-2 text-gray-600">Monitor and manage compliance frameworks</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {frameworks.map((framework) => (
              <Card key={framework.name}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{framework.name}</h3>
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-gray-900">{framework.score}%</p>
                      <p className="text-sm text-gray-600 mt-1">Compliance Score</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${framework.score}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">{framework.requirements} requirements</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Findings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">GDPR - Data Access Rights</p>
                    <p className="text-sm text-gray-600">Requirement verified and documented</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Compliant
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">HIPAA - Audit Controls</p>
                    <p className="text-sm text-gray-600">Partial implementation - review needed</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    Review
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </>
  );
}
