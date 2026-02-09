import React, { useState } from 'react';
import { SparklesIcon, DownloadIcon, SaveIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
export const ProposalForm = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    clientName: 'Acme Corporation',
    projectTitle: 'Digital Transformation Initiative',
    executiveSummary: '',
    scope: '',
    timeline: '',
    budget: '',
    deliverables: ''
  });
  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setFormData({
        ...formData,
        executiveSummary: 'Acme Corporation seeks to modernize its digital infrastructure to improve operational efficiency and customer experience. This proposal outlines a comprehensive digital transformation initiative that will deliver measurable ROI within 12 months through cloud migration, process automation, and enhanced analytics capabilities.',
        scope: '• Cloud infrastructure migration\n• Legacy system modernization\n• Customer portal development\n• Data analytics platform implementation\n• Staff training and change management',
        timeline: 'Phase 1 (Months 1-3): Discovery and planning\nPhase 2 (Months 4-6): Infrastructure setup\nPhase 3 (Months 7-9): Application development\nPhase 4 (Months 10-12): Testing and deployment',
        budget: 'Total Investment: $450,000\n• Infrastructure: $180,000\n• Development: $150,000\n• Training: $50,000\n• Contingency: $70,000',
        deliverables: '• Cloud-based infrastructure\n• Modernized applications\n• Customer self-service portal\n• Analytics dashboard\n• Training materials and documentation'
      });
      setIsGenerating(false);
    }, 2000);
  };
  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  return <div className="p-6 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Client Proposal</CardTitle>
              <CardDescription>AI-powered proposal generation</CardDescription>
            </div>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              <SparklesIcon className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate with AI'}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Client Name */}
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name</Label>
            <Input id="clientName" value={formData.clientName} onChange={e => handleChange('clientName', e.target.value)} />
          </div>

          {/* Project Title */}
          <div className="space-y-2">
            <Label htmlFor="projectTitle">Project Title</Label>
            <Input id="projectTitle" value={formData.projectTitle} onChange={e => handleChange('projectTitle', e.target.value)} />
          </div>

          {/* Executive Summary */}
          <div className="space-y-2">
            <Label htmlFor="executiveSummary">Executive Summary</Label>
            <Textarea id="executiveSummary" value={formData.executiveSummary} onChange={e => handleChange('executiveSummary', e.target.value)} rows={4} placeholder="Brief overview of the proposal..." />
          </div>

          {/* Scope */}
          <div className="space-y-2">
            <Label htmlFor="scope">Project Scope</Label>
            <Textarea id="scope" value={formData.scope} onChange={e => handleChange('scope', e.target.value)} rows={5} placeholder="Key deliverables and scope items..." />
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <Label htmlFor="timeline">Timeline</Label>
            <Textarea id="timeline" value={formData.timeline} onChange={e => handleChange('timeline', e.target.value)} rows={4} placeholder="Project phases and milestones..." />
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget">Budget Breakdown</Label>
            <Textarea id="budget" value={formData.budget} onChange={e => handleChange('budget', e.target.value)} rows={4} placeholder="Cost breakdown and investment details..." />
          </div>

          {/* Deliverables */}
          <div className="space-y-2">
            <Label htmlFor="deliverables">Key Deliverables</Label>
            <Textarea id="deliverables" value={formData.deliverables} onChange={e => handleChange('deliverables', e.target.value)} rows={4} placeholder="List of deliverables..." />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-slate-200">
            <Button variant="default">
              <SaveIcon className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button variant="secondary">
              <DownloadIcon className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>;
};