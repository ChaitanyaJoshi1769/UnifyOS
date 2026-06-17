import { useState } from 'react';
import Head from 'next/head';
import SearchLayout from '@/components/SearchLayout';
import { Card } from '@/components/ui/Card';
import { Search, Filter, Star, Download, Share2 } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results] = useState([
    {
      id: '1',
      title: 'Q4 Financial Report 2024',
      type: 'pdf',
      classification: 'CONFIDENTIAL',
      owner: 'John Smith',
      modified: '2024-01-15',
      relevance: 95,
    },
    {
      id: '2',
      title: 'Product Roadmap 2024-2025',
      type: 'document',
      classification: 'INTERNAL',
      owner: 'Product Team',
      modified: '2024-01-14',
      relevance: 87,
    },
    {
      id: '3',
      title: 'Customer Contract Template',
      type: 'docx',
      classification: 'RESTRICTED',
      owner: 'Legal Department',
      modified: '2024-01-10',
      relevance: 76,
    },
    {
      id: '4',
      title: 'Sales Strategy Q1',
      type: 'presentation',
      classification: 'INTERNAL',
      owner: 'Sales Team',
      modified: '2024-01-08',
      relevance: 82,
    },
  ]);

  const classificationColors: Record<string, string> = {
    CONFIDENTIAL: 'bg-red-100 text-red-800',
    INTERNAL: 'bg-yellow-100 text-yellow-800',
    RESTRICTED: 'bg-orange-100 text-orange-800',
    PUBLIC: 'bg-green-100 text-green-800',
  };

  return (
    <>
      <Head>
        <title>Search - UnifyOS</title>
      </Head>
      <SearchLayout>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">Enterprise Search</h1>
            <p className="text-lg text-gray-600">Find documents across all your data sources</p>

            <div className="mt-6 flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents, data, knowledge..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter size={20} />
                Filters
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">{results.length} results found</p>

            {results.map((result) => (
              <Card key={result.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-blue-600 hover:text-blue-800 cursor-pointer">
                        {result.title}
                      </h2>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                        <span className="capitalize">{result.type}</span>
                        <span>{result.owner}</span>
                        <span>{result.modified}</span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            classificationColors[result.classification]
                          }`}
                        >
                          {result.classification}
                        </span>
                      </div>
                      <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${result.relevance}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Relevance: {result.relevance}%</p>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button className="p-2 text-gray-600 hover:text-yellow-500">
                        <Star size={20} />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-blue-600">
                        <Download size={20} />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-green-600">
                        <Share2 size={20} />
                      </button>
                    </div>
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
