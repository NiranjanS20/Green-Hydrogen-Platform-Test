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
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPaper, setNewPaper] = useState({
    title: '',
    abstract: '',
    authors: '',
    source: '',
    topic: 'Production' as ResearchPaper['topic'],
    pdf_url: ''
  });

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

  const handleAddPaper = () => {
    if (!newPaper.title || !newPaper.abstract || !newPaper.authors || !newPaper.source) {
      alert('Please fill in all required fields');
      return;
    }

    const paper: ResearchPaper = {
      id: 'p' + Date.now(),
      title: newPaper.title,
      abstract: newPaper.abstract,
      authors: newPaper.authors.split(',').map(a => a.trim()),
      published_date: new Date().toISOString().split('T')[0],
      source: newPaper.source,
      topic: newPaper.topic,
      pdf_url: newPaper.pdf_url || undefined
    };

    setPapers([paper, ...papers]);
    setShowAddModal(false);
    setNewPaper({
      title: '',
      abstract: '',
      authors: '',
      source: '',
      topic: 'Production',
      pdf_url: ''
    });
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

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold gradient-text">Research Papers</h1>
        <div className="flex gap-4 items-center">
          <Input
            placeholder="Search papers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-xl"
          />
          <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <Plus className="w-5 h-5 mr-2" />
            Add Paper
          </Button>
        </div>
      </div>

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

      {/* Add Paper Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Add Research Paper</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <Input
                  value={newPaper.title}
                  onChange={(e) => setNewPaper({...newPaper, title: e.target.value})}
                  placeholder="Paper title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Abstract *</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={newPaper.abstract}
                  onChange={(e) => setNewPaper({...newPaper, abstract: e.target.value})}
                  placeholder="Paper abstract"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Authors * (comma-separated)</label>
                  <Input
                    value={newPaper.authors}
                    onChange={(e) => setNewPaper({...newPaper, authors: e.target.value})}
                    placeholder="Dr. A. Smith, Dr. B. Jones"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Source *</label>
                  <Input
                    value={newPaper.source}
                    onChange={(e) => setNewPaper({...newPaper, source: e.target.value})}
                    placeholder="Journal name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Topic</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newPaper.topic}
                    onChange={(e) => setNewPaper({...newPaper, topic: e.target.value as ResearchPaper['topic']})}
                  >
                    <option value="Production">Production</option>
                    <option value="Storage">Storage</option>
                    <option value="Transport">Transport</option>
                    <option value="Policy">Policy</option>
                    <option value="Economics">Economics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">PDF URL (optional)</label>
                  <Input
                    value={newPaper.pdf_url}
                    onChange={(e) => setNewPaper({...newPaper, pdf_url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPaper} className="bg-purple-600 text-white">
                Add Paper
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
