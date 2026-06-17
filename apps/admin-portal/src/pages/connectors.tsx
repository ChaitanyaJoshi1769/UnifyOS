import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Plus, Trash2, RotateCw } from 'lucide-react';

export default function Connectors() {
  const [connectors] = useState([
    {
      id: '1',
      name: 'Google Drive',
      type: 'cloud-storage',
      status: 'connected',
      documentsScanned: 12500,
      lastSync: '2024-01-15',
    },
    {
      id: '2',
      name: 'Salesforce',
      type: 'crm',
      status: 'connected',
      documentsScanned: 8750,
      lastSync: '2024-01-15',
    },
    {
      id: '3',
      name: 'SharePoint',
      type: 'collaboration',
      status: 'scanning',
      documentsScanned: 45000,
      lastSync: '2024-01-15',
    },
    {
      id: '4',
      name: 'AWS S3',
      type: 'object-storage',
      status: 'connected',
      documentsScanned: 125000,
      lastSync: '2024-01-14',
    },
  ]);

  return (
    <>
      <Head>
        <title>Connectors - UnifyOS Admin</title>
      </Head>
      <Layout>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Connectors</h1>
              <p className="mt-2 text-gray-600">Manage data source integrations</p>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Plus size={20} />
              Add Connector
            </button>
          </div>

          <div className="space-y-4">
            {connectors.map((connector) => (
              <Card key={connector.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{connector.name}</h3>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="text-xs text-gray-500">Type</p>
                          <p className="font-medium text-gray-900 capitalize">{connector.type}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Documents Scanned</p>
                          <p className="font-medium text-gray-900">
                            {(connector.documentsScanned / 1000).toFixed(1)}K
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Last Sync</p>
                          <p className="font-medium text-gray-900">{connector.lastSync}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          connector.status === 'connected'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {connector.status === 'connected' ? 'Connected' : 'Scanning'}
                      </span>
                      <button className="p-2 text-gray-600 hover:text-blue-600">
                        <RotateCw size={18} />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-red-600">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    </>
  );
}
