import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface EngagementScoreCardProps {
  score: number;
  predictiveScore: number;
}

export function EngagementScoreCard({ score, predictiveScore }: EngagementScoreCardProps) {
  const scoreColor = score >= 70
    ? 'text-green-500'
    : score >= 40
    ? 'text-yellow-500'
    : 'text-red-500';

  const predictiveColor = predictiveScore >= 70
    ? 'text-green-500'
    : predictiveScore >= 40
    ? 'text-yellow-500'
    : 'text-red-500';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Engagement Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-slate-400">Current</span>
            <span className={`text-2xl font-bold ${scoreColor}`}>{score}</span>
          </div>
          <Progress value={score} className="h-2" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-slate-400">Predictive</span>
            <span className={`text-lg font-semibold ${predictiveColor}`}>{predictiveScore}</span>
          </div>
          <Progress value={predictiveScore} className="h-2" />
        </div>

        <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
            {score >= 50 ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span>Engagement trending up</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span>Engagement needs attention</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

