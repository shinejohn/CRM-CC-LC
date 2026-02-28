import React from 'react';
import { ThumbsUp, MessageCircle, Share2, Calendar } from 'lucide-react';
interface SocialPostServiceViewProps {
  service: any;
}
export function SocialPostServiceView({
  service
}: SocialPostServiceViewProps) {
  return <div className="space-y-6">
      {/* Scheduled Posts */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-900">Scheduled Queue</h3>
          <button className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors">
            Create Post
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {[{
          content: 'Join us this weekend for the annual charity run! 🏃‍♂️ #Community #Charity',
          time: 'Tomorrow, 9:00 AM',
          platform: 'Facebook'
        }, {
          content: 'New menu items arriving next week. Sneak peek inside... 🍔',
          time: 'Wed, 12:00 PM',
          platform: 'Instagram'
        }].map((post, i) => <div key={i} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-6 w-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-slate-900 font-medium line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                        {post.platform}
                      </span>
                      <span>Scheduled for {post.time}</span>
                    </div>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                  Edit
                </button>
              </div>
            </div>)}
        </div>
      </div>

      {/* Recent Performance */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Recent Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[{
          content: 'Thank you to everyone who came out yesterday! What an amazing turnout.',
          likes: 245,
          comments: 42,
          shares: 18,
          date: '2 days ago'
        }, {
          content: 'We are hiring! Join our growing team.',
          likes: 189,
          comments: 56,
          shares: 89,
          date: '4 days ago'
        }].map((post, i) => <div key={i} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <p className="text-slate-800 mb-4 line-clamp-2">{post.content}</p>
              <div className="text-xs text-slate-500 mb-4">{post.date}</div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1 text-slate-600 text-sm">
                  <ThumbsUp className="h-4 w-4" /> {post.likes}
                </div>
                <div className="flex items-center gap-1 text-slate-600 text-sm">
                  <MessageCircle className="h-4 w-4" /> {post.comments}
                </div>
                <div className="flex items-center gap-1 text-slate-600 text-sm">
                  <Share2 className="h-4 w-4" /> {post.shares}
                </div>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
}