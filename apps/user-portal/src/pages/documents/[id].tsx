import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import SearchLayout from '@/components/SearchLayout';
import { Card } from '@/components/ui/Card';
import { Download, Share2, ArrowLeft, Eye, BarChart3 } from 'lucide-react';

export default function DocumentViewer() {
  const router = useRouter();
  const { id } = router.query;

  const [document] = useState({
    id: id || '1',
    title: 'Q4 Financial Report 2024',
    type: 'PDF',
    size: '2.4 MB',
    owner: 'John Smith',
    created: '2024-01-01',
    modified: '2024-01-15',
    classification: 'CONFIDENTIAL',
    description: 'Comprehensive financial report for Q4 2024 including revenue, expenses, and projections',
    tags: ['finance', 'report', 'q4', 'confidential'],
    relatedDocuments: [
      'Q3 Financial Report 2024',
      'Annual Budget 2024',
      'Financial Forecasts',
    ],
    metadata: {
      'Date Range': 'Oct 1 - Dec 31, 2024',
      'Department': 'Finance',
      'Reviewed By': 'CFO',
      'Status': 'Published',
    },
  });

  return (
    <>
      <Head>
        <title>{document.title} - UnifyOS</title>
      </Head>
      <SearchLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Results
          </button>

          <Card>
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">{document.title}</h1>
                  <p className="mt-2 text-gray-600">
                    {document.type} • {document.size}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Download size={18} />
                    Download
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Share2 size={18} />
                    Share
                  </button>
                </div>
              </div>

              <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center mb-8">
                <div className="text-center">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Document viewer would display PDF content here</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">METADATA</h3>
                  <div className="space-y-3">
                    {Object.entries(document.metadata).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs text-gray-600">{key}</p>
                        <p className="font-medium text-gray-900">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">INFORMATION</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-600">Classification</p>
                      <p className="font-medium text-red-700">{document.classification}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Owner</p>
                      <p className="font-medium text-gray-900">{document.owner}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Last Modified</p>
                      <p className="font-medium text-gray-900">{document.modified}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {document.relatedDocuments.length > 0 && (
            <Card>
              <div className="p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Documents</h2>
                <div className="space-y-2">
                  {document.relatedDocuments.map((doc) => (
                    <div
                      key={doc}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <p className="font-medium text-gray-900">{doc}</p>
                      <BarChart3 size={18} className="text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </SearchLayout>
    </>
  );
}
