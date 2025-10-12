'use client';

import { useState, useEffect } from 'react';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { BookOpen, Search, Plus, Trash2, Calendar, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';

type ResearchPaper = {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  published_date: string;
  source: string;
  topic: 'Production' | 'Storage' | 'Transport' | 'Policy' | 'Economics';
  pdf_url?: string;
};

export default function ResearchPage() {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [, setShowAddModal] = useState(false);

  useEffect(() => {
    loadPapers();
  }, []);

  const loadPapers = async () => {
    // Replace with Supabase fetch if needed
    setPapers([
      {
        id: 'p1',
        title: 'Advances in PEM Electrolyzers',
        abstract: 'This paper explores recent improvements in PEM electrolyzer efficiency and cost reduction.',
        authors: ['Dr. A. Sharma', 'Dr. K. Mehta'],
        published_date: '2025-09-15',
        source: 'Nature Energy',
        topic: 'Production',
      },
      {
        id: 'p2',
        title: 'Hydrogen Storage in Metal Hydrides',
        abstract: 'A comparative study of hydride-based storage systems for long-term hydrogen retention.',
        authors: ['Dr. R. Singh'],
        published_date: '2025-08-10',
        source: 'IEEE Transactions',
        topic: 'Storage',
      },
    ]);
    setLoading(false);
  };

  const handleDeletePaper = (id: string) => {
    setPapers(papers.filter((p) => p.id !== id));
  };

  const filteredPapers = papers.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.authors.join(', ').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topicStats = ['Production', 'Storage', 'Transport', 'Policy', 'Economics'].map((topic) => ({
    topic,
    count: papers.filter((p) => p.topic === topic).length,
  }));

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between glassmorphic-strong rounded-2xl p-6">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Hydrogen Research</h1>
          <p className="text-gray-700">Explore publications and standards in hydrogen science</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <Plus className="w-5 h-5 mr-2" />
          Add Paper
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <Search className="w-5 h-5 text-gray-500" />
        <Input
          placeholder="Search by title, abstract, or author"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-xl"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Research Topics</CardTitle>
          <CardDescription>Distribution of papers by topic</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topicStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="topic" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#6366F1" name="Paper Count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Research Papers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredPapers.map((paper) => (
            <div key={paper.id} className="p-4 rounded-xl border bg-white/40 hover:bg-white/60 transition">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex gap-2 items-center mb-1">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-bold">{paper.title}</h3>
                    <Badge>{paper.topic}</Badge>
                  </div>
                  <p className="text-sm text-gray-700">{paper.abstract}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    <FileText className="inline w-4 h-4 mr-1" />
                    {paper.authors.join(', ')} — {paper.source}
                  </p>
                  <p className="text-xs text-gray-500">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    {formatDate(paper.published_date)}
                  </p>
                </div>
                <Button variant="ghost" className="border border-white/10" onClick={() => handleDeletePaper(paper.id)}>
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
