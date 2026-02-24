import { Heart, MessageSquare, Share2, ExternalLink, Calendar, Tag, Ticket, HelpCircle } from 'lucide-react';

export interface SyndicatedPost {
    id: string;
    content: string;
    post_type: 'announcement_share' | 'classified_share' | 'coupon_share' | 'event_share' | string;
    linked_type: string;
    linked_id: string;
    image_url: string | null;
    user: { id: string; name: string; profile_picture: string | null };
    created_at: string;
    likes_count: number;
    comments_count: number;
}

interface SyndicatedPostCardProps {
    post: SyndicatedPost;
}

export function SyndicatedPostCard({ post }: SyndicatedPostCardProps) {
    const getCardStyle = () => {
        switch (post.post_type) {
            case 'announcement_share':
                return 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800/50';
            case 'classified_share':
                return 'bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800/50';
            case 'coupon_share':
                return 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-300 dark:border-blue-700 border-dashed';
            case 'event_share':
                return 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800/50';
            default:
                return 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700';
        }
    };

    const getLabel = () => {
        switch (post.post_type) {
            case 'announcement_share': return { text: 'Community Announcement', icon: <Heart className="w-3.5 h-3.5" />, color: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30' };
            case 'classified_share': return { text: 'Marketplace Listing', icon: <Tag className="w-3.5 h-3.5" />, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30' };
            case 'coupon_share': return { text: 'Special Deal', icon: <Ticket className="w-3.5 h-3.5" />, color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30' };
            case 'event_share': return { text: 'Upcoming Event', icon: <Calendar className="w-3.5 h-3.5" />, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30' };
            default: return { text: 'Sponsored Post', icon: <HelpCircle className="w-3.5 h-3.5" />, color: 'text-gray-600 bg-gray-100' };
        }
    };

    const label = getLabel();

    return (
        <div className={`rounded-xl border ${getCardStyle()} overflow-hidden mb-4 shadow-sm hover:shadow-md transition-shadow`}>
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                        {post.user.profile_picture ? (
                            <img src={post.user.profile_picture} alt={post.user.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold bg-gray-100">
                                {post.user.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">
                            {post.user.name}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1.5">
                            <span>{post.created_at}</span>
                            <span>·</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider flex items-center gap-1 ${label.color}`}>
                                {label.icon} {label.text}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Body with Image */}
            <div className="p-4">
                {post.image_url && (
                    <div className="w-full h-48 bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden mb-4">
                        <img src={post.image_url} alt="Content header" className="w-full h-full object-cover" />
                    </div>
                )}
                <p className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">
                    {post.content}
                </p>
            </div>

            {/* CTA Footer */}
            <div className="px-4 py-3 bg-white/60 dark:bg-slate-800/60 border-t border-gray-100 dark:border-slate-700/50 flex items-center justify-between">
                <div className="flex gap-4">
                    <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium">
                        <Heart className="w-4 h-4" />
                        <span>{post.likes_count}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments_count}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium">
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>

                <button className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors">
                    View Details
                    <ExternalLink className="w-4 h-4" />
                </button>
            </div>

            {/* Attribution */}
            <div className="px-4 py-2 bg-gray-50/50 dark:bg-slate-900/30 text-[10px] text-center text-gray-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                via Day.News Commerce
            </div>
        </div>
    );
}
