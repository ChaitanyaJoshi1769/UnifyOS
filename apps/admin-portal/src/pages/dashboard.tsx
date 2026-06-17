import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Activity, CheckCircle, AlertCircle, Zap } from 'lucide-react';

export default function Dashboard() {
  const [services] = useState([
    { name: 'API Gateway', status: 'healthy', uptime: '99.9%', responseTime: '45ms' },
    { name: 'Connector Service', status: 'healthy', uptime: '99.8%', responseTime: '120ms' },
    { name: 'Discovery Service', status: 'healthy', uptime: '99.7%', responseTime: '250ms' },
    { name: 'Search Service', status: 'healthy', uptime: '99.9%', responseTime: '80ms' },
    { name: 'Knowledge Graph', status: 'healthy', uptime: '99.6%', responseTime: '150ms' },
    { name: 'Compliance Service', status: 'healthy', uptime: '99.8%', responseTime: '110ms' },
  ]);

  const stats = [
    { label: 'Active Connectors', value: '847', icon: Zap, color: 'blue' },
    { label: 'Documents Indexed', value: '2.3M', icon: Activity, color: 'green' },
    { label: 'System Health', value: '99.8%', icon: CheckCircle, color: 'green' },
    { label: 'Compliance Score', value: '94%', icon: AlertCircle, color: 'yellow' },
  ];

  return (
    <>
      <Head>
        <title>Dashboard - UnifyOS Admin</title>
      </Head>
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome back to UnifyOS Platform Management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      </div>
                      <Icon className={`w-10 h-10 text-${stat.color}-500`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Service Health Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-600">Uptime: {service.uptime} | Response: {service.responseTime}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-700">Healthy</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </>
  );
}
