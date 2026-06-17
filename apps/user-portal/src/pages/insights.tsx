import { useState } from 'react';
import Head from 'next/head';
import SearchLayout from '@/components/SearchLayout';
import { Card } from '@/components/ui/Card';
import { TrendingUp, Lightbulb, Zap, BookOpen } from 'lucide-react';

export default function Insights() {
  const [insights] = useState([
    {
      id: '1',
      type: 'entity',
      title: 'Key Stakeholder Analysis',
      description: 'Identified 15 key stakeholders mentioned across 124 documents',
      frequency: 'High',
      icon: TrendingUp,
    },
    {
      id: '2',
      type: 'relationship',
      title: 'Department Collaboration Patterns',
      description: 'Finance and Sales teams collaborate on 48% of documents',
      frequency: 'Medium',
      icon: Zap,
    },
    {
      id: '3',
      type: 'trend',
      title: 'Content Growth Trend',
      description: 'Document creation increased by 35% in Q4 vs Q3',
      frequency: 'High',
      icon: TrendingUp,
    },
    {
      id: '4',
      type: 'anomaly',
      title: 'Unusual Access Pattern',
      description: '8 documents accessed after business hours by external stakeholders',
      frequency: 'Low',
      icon: Lightbulb,
    },
  ]);

  const [trendingTopics] = useState([
    'Digital Transformation',
    'Customer Experience',
    'Cloud Migration',
    'Data Privacy',
    'AI & Machine Learning',
  ]);

  return (
    <>
      <Head>
        <title>Insights - UnifyOS</title>
      </Head>
      <SearchLayout>
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">AI-Powered Insights</h1>
            <p className="mt-2 text-gray-600">Discover patterns, trends, and key insights from your data</p>
          </div>

          <div className="grid gap-6">
            {insights.map((insight) => {
              const Icon = insight.icon;
              return (
                <Card key={insight.id}>
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-900">{insight.title}</h2>
                        <p className="mt-1 text-gray-600">{insight.description}</p>
                        <div className="mt-4 flex items-center gap-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              insight.frequency === 'High'
                                ? 'bg-red-100 text-red-800'
                                : insight.frequency === 'Medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {insight.frequency} Frequency
                          </span>
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Learn more →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen size={20} />
                Trending Topics
              </h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {trendingTopics.map((topic) => (
                  <button
                    key={topic}
                    className="px-4 py-2 bg-gray-100 hover:bg-blue-100 text-gray-900 rounded-full text-sm font-medium transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </SearchLayout>
    </>
  );
}
