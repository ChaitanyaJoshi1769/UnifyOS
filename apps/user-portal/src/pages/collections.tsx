import { useState } from 'react';
import Head from 'next/head';
import SearchLayout from '@/components/SearchLayout';
import { Card } from '@/components/ui/Card';
import { Plus, Trash2, Users, FileText } from 'lucide-react';

export default function Collections() {
  const [collections] = useState([
    {
      id: '1',
      name: 'Q4 Financial Docs',
      description: 'All Q4 2024 financial documents and reports',
      itemCount: 23,
      sharedWith: 5,
      modified: '2024-01-15',
    },
    {
      id: '2',
      name: 'Product Roadmap',
      description: 'Product development roadmap and planning documents',
      itemCount: 12,
      sharedWith: 8,
      modified: '2024-01-14',
    },
    {
      id: '3',
      name: 'Legal Contracts',
      description: 'Master contracts and agreement templates',
      itemCount: 47,
      sharedWith: 3,
      modified: '2024-01-10',
    },
  ]);

  return (
    <>
      <Head>
        <title>Collections - UnifyOS</title>
      </Head>
      <SearchLayout>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Collections</h1>
              <p className="mt-2 text-gray-600">Organize and manage your document collections</p>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Plus size={20} />
              New Collection
            </button>
          </div>

          <div className="grid gap-6">
            {collections.map((collection) => (
              <Card key={collection.id}>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900">{collection.name}</h2>
                      <p className="mt-1 text-gray-600">{collection.description}</p>
                      <div className="mt-4 flex gap-6 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FileText size={18} />
                          {collection.itemCount} items
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users size={18} />
                          Shared with {collection.sharedWith}
                        </div>
                        <div className="text-gray-500">Modified {collection.modified}</div>
                      </div>
                    </div>
                    <button className="p-2 text-gray-600 hover:text-red-600">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </SearchLayout>
    </>
  );
}
