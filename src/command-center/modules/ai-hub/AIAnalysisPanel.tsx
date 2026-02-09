import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Users, DollarSign, FileText, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AnalysisType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const analysisTypes: AnalysisType[] = [
  {
    id: 'customer-engagement',
    name: 'Customer Engagement',
    description: 'Analyze customer interaction patterns and engagement scores',
    icon: Users,
    color: 'blue',
  },
  {
    id: 'revenue-trends',
    name: 'Revenue Trends',
    description: 'Identify revenue patterns and growth opportunities',
    icon: DollarSign,
    color: 'green',
  },
  {
    id: 'content-performance',
    name: 'Content Performance',
    description: 'Evaluate content effectiveness and audience response',
    icon: FileText,
    color: 'purple',
  },
  {
    id: 'predictive-insights',
    name: 'Predictive Insights',
    description: 'AI-powered predictions for customer behavior and trends',
    icon: Sparkles,
    color: 'pink',
  },
];

export function AIAnalysisPanel() {
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runAnalysis = async (analysisId: string) => {
    setSelectedAnalysis(analysisId);
    setIsAnalyzing(true);
    
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Analysis</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Get AI-powered insights about your business, customers, and content
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analysisTypes.map((analysis) => {
          const Icon = analysis.icon;
          const isSelected = selectedAnalysis === analysis.id;
          
          return (
            <motion.div
              key={analysis.id}
              whileHover={{ y: -4 }}
            >
              <Card className={`transition-all ${isSelected ? 'ring-2 ring-purple-500' : ''}`}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-${analysis.color}-100 dark:bg-${analysis.color}-900/30 rounded-lg`}>
                      <Icon className={`w-6 h-6 text-${analysis.color}-600 dark:text-${analysis.color}-400`} />
                    </div>
                    <Badge variant="outline">{analysis.name}</Badge>
                  </div>
                  
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                    {analysis.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                    {analysis.description}
                  </p>

                  <Button
                    className="w-full"
                    onClick={() => runAnalysis(analysis.id)}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing && isSelected ? (
                      <>
                        <BarChart2 className="w-4 h-4 mr-2 animate-pulse" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Run Analysis
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Results placeholder */}
      {selectedAnalysis && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Analysis Results
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Analysis completed. Results will be displayed here.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

