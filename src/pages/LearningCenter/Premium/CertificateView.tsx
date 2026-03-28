import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Linkedin, Share2, ArrowLeft, Award, CheckCircle } from 'lucide-react';
import { Link } from 'react-router';

export const CertificateView: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation */}
        <div className="flex justify-between items-center text-white">
          <Link to="/learning-center/premium" className="flex items-center text-sm font-medium hover:text-amber-400 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Premium Library
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-9">
              <Share2 className="w-4 h-4 mr-2" /> Share Link
            </Button>
            <Button variant="default" className="bg-[#0A66C2] hover:bg-[#004182] text-white border-0 h-9">
              <Linkedin className="w-4 h-4 mr-2" /> Add to Profile
            </Button>
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900 border-0 h-9">
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </Button>
          </div>
        </div>

        {/* Certificate Display Frame */}
        <div className="relative mx-auto rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-slate-700/50 max-w-4xl aspect-[1.414/1] bg-white p-2">
          {/* Internal border for certificate authentic look */}
          <div className="absolute inset-4 border-[12px] border-[#1e293b] rounded-sm pointer-events-none"></div>
          <div className="absolute inset-8 border-[1px] border-[#cbd5e1] rounded-sm pointer-events-none"></div>
          
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-16 relative">
            
            {/* Background seal watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <Award className="w-96 h-96" />
            </div>

            {/* Header Content */}
            <div className="mb-8">
              <h2 className="text-sm font-bold tracking-[0.2em] text-slate-500 uppercase mb-8">Fibonacco Learning Center</h2>
              <h1 className="text-4xl sm:text-5xl font-serif text-slate-900">Certificate of Completion</h1>
            </div>

            {/* Recipient Content */}
            <div className="space-y-4 mb-12 relative z-10 w-full max-w-2xl mx-auto">
              <p className="text-lg text-slate-600">This certifies that</p>
              <div className="border-b-2 border-slate-300 pb-2">
                <p className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif italic text-amber-600">
                  Alex Montgomery
                </p>
              </div>
              <p className="text-lg text-slate-600 pt-2">has successfully completed all requirements and exams for</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">Advanced AI Prompt Engineering</p>
            </div>

            {/* Footer Signatures */}
            <div className="grid grid-cols-2 w-full max-w-2xl gap-16 mt-auto">
              <div className="flex flex-col items-center">
                <div className="h-16 flex items-end justify-center mb-2 w-full border-b border-slate-300">
                  <span className="font-script text-3xl font-bold text-slate-800 -mb-2 transform -rotate-2">J. Shine</span>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Director of Education</p>
              </div>
              
              <div className="flex flex-col items-center justify-end">
                <div className="flex flex-col items-center justify-center gap-1 mb-2 h-16 w-full">
                  <Award className="w-10 h-10 text-amber-500" />
                </div>
                <div className="border-t border-slate-300 w-full pt-2 flex flex-col items-center">
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date: Oct 24, 2026</p>
                   <p className="text-[10px] text-slate-400 mt-1">ID: CERT-1090-XY294</p>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* Verification Info */}
        <div className="text-center text-slate-400 text-sm flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          This certificate is cryptographically verified by Fibonacco Platform.
        </div>
      </div>
    </div>
  );
};
