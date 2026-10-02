import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Radio, Heart, MessageSquare, Award, Send, Check } from 'lucide-react';
import { FeedPost } from '../../types';

export const EngagementModule: React.FC = () => {
  const { feedPosts, toggleLikePost, votePoll, createPost, currentUser, employees, currentTenant } = useApp();
  const [newContent, setNewContent] = useState('');
  const [postType, setPostType] = useState<FeedPost['type']>('Announcement');
  const [badgeType, setBadgeType] = useState<FeedPost['badgeType']>('Star Performer');
  const [recipientName, setRecipientName] = useState(employees[1]?.fullName || 'Alex Rivera');

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent) return;

    createPost(newContent, postType, postType === 'Kudos' ? badgeType : undefined, postType === 'Kudos' ? recipientName : undefined);
    setNewContent('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-[#1E293B]">
        <h1 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
          <Radio className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6]" />
          <span>ARQENSIAL Pulse & Culture Feed</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-0.5">
          Company announcements, peer recognition badges, town hall discussions & pulse polls for {currentTenant.name}
        </p>
      </div>

      {/* Post Creator Box */}
      <form onSubmit={handlePost} className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPostType('Announcement')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              postType === 'Announcement' ? 'bg-[#0F766E] text-white' : 'bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-[#CBD5E1]'
            }`}
          >
            Announcement
          </button>
          <button
            type="button"
            onClick={() => setPostType('Kudos')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              postType === 'Kudos' ? 'bg-[#14B8A6] text-white' : 'bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-[#CBD5E1]'
            }`}
          >
            Give Peer Kudos
          </button>
        </div>

        {postType === 'Kudos' && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Select Colleague</label>
              <select
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC]"
              >
                {employees.map(e => (
                  <option key={e.id} value={e.fullName}>
                    {e.fullName} ({e.designation})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Badge Type</label>
              <select
                value={badgeType}
                onChange={e => setBadgeType(e.target.value as FeedPost['badgeType'])}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC]"
              >
                <option value="Star Performer">Star Performer ⭐</option>
                <option value="Innovation Champion">Innovation Champion 💡</option>
                <option value="Team Player">Team Player 🤝</option>
                <option value="Customer Hero">Customer Hero 🛡️</option>
              </select>
            </div>
          </div>
        )}

        <textarea
          rows={2}
          required
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
          placeholder={`Share an update or celebrate an achievement with ${currentTenant.name}...`}
          className="w-full p-2.5 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:ring-1 focus:ring-[#0F766E]"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish to Feed</span>
          </button>
        </div>
      </form>

      {/* Feed Stream */}
      <div className="space-y-4">
        {feedPosts.map(post => (
          <div
            key={post.id}
            className="p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs space-y-3"
          >
            {/* Author */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] text-white font-bold text-xs flex items-center justify-center">
                  {post.authorName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-[#F8FAFC]">
                    {post.authorName}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-[#CBD5E1]">{post.authorRole}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {post.badgeType && (
                  <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Award className="w-3 h-3" /> {post.badgeType}
                  </span>
                )}
                <span className="text-[10px] text-slate-400 font-mono">{post.timestamp}</span>
              </div>
            </div>

            {/* Content text */}
            <p className="text-xs text-slate-800 dark:text-[#CBD5E1] leading-relaxed whitespace-pre-line">
              {post.content}
            </p>

            {/* Poll Interactive Element */}
            {post.pollData && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#020617]/50 border border-slate-200 dark:border-[#1E293B] space-y-2 mt-2">
                <p className="font-bold text-xs text-slate-900 dark:text-[#F8FAFC] mb-2">
                  {post.pollData.question}
                </p>
                <div className="space-y-2">
                  {post.pollData.options.map(opt => {
                    const isSelected = post.pollData?.userVotedOptionId === opt.id;
                    const totalVotes = post.pollData?.options.reduce((acc, o) => acc + o.votes, 0) || 1;
                    const percent = Math.round((opt.votes / totalVotes) * 100);
                    return (
                      <div
                        key={opt.id}
                        onClick={() => votePoll(post.id, opt.id)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#0F766E] bg-teal-50/50 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#F8FAFC]'
                            : 'border-slate-200 dark:border-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#1E293B] text-slate-800 dark:text-[#CBD5E1]'
                        }`}
                      >
                        <div className="flex items-center justify-between font-medium">
                          <span className="flex items-center gap-1.5">
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />}
                            {opt.text}
                          </span>
                          <span className="font-mono text-slate-500 tabular-nums">{percent}% ({opt.votes})</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-[#1E293B] h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-[#0F766E] h-full rounded-full transition-all" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <button
                onClick={() => toggleLikePost(post.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  post.userLiked ? 'text-rose-600 font-semibold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${post.userLiked ? 'fill-rose-500' : ''}`} />
                <span>{post.likes} Likes</span>
              </button>

              <span className="text-[11px] font-mono text-slate-400">
                {post.comments.length} comments
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
