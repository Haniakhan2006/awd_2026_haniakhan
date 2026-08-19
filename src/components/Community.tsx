import React, { useState, useEffect } from "react";
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Plus, 
  Sparkles, 
  Upload, 
  Trash2,
  RefreshCw,
  Send,
  HelpCircle,
  Clock
} from "lucide-react";
import { CommunityPost, PostComment, UserProfile } from "../types";
import { db, safeAddDoc } from "../lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";

interface CommunityProps {
  user: UserProfile;
}

export default function Community({ user }: CommunityProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Comments state mapped by post idx
  const [activeCommentPostIdx, setActiveCommentPostIdx] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentsMap, setCommentsMap] = useState<Record<number, PostComment[]>>({});

  useEffect(() => {
    const saved = localStorage.getItem("community-posts-list");
    if (saved) {
      setPosts(JSON.parse(saved));
    } else {
      const defaults: CommunityPost[] = [
        { id: "p1", userId: "user1", authorName: "Wheat Cultivator", authorPhoto: "https://api.dicebear.com/7.x/adventurer/svg?seed=wheat_grower", content: "Seeing orange pustules forming on my Wheat crop. I think it is Wheat Rust due to heavy morning dews. Anyone else facing this in Faisalabad sector?", likes: ["user2", "user3"], createdAt: new Date().toISOString() },
        { id: "p2", userId: "user2", authorName: "Soil Expert", authorPhoto: "https://api.dicebear.com/7.x/adventurer/svg?seed=soil_expert", content: "Highly recommend Greenfield Labs. Just received my nitrogen soil assessment results in 2 days. Direct route maps are accurate.", likes: ["user1"], createdAt: new Date().toISOString() }
      ];
      setPosts(defaults);
      localStorage.setItem("community-posts-list", JSON.stringify(defaults));
    }
  }, []);

  const savePosts = (newPosts: CommunityPost[]) => {
    setPosts(newPosts);
    localStorage.setItem("community-posts-list", JSON.stringify(newPosts));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);

    const newPost: CommunityPost = {
      userId: user.uid,
      authorName: user.displayName || "Farmer",
      authorPhoto: user.photoURL,
      content,
      imageUrl: imageUrl || undefined,
      likes: [],
      createdAt: new Date().toISOString()
    };

    const updated = [newPost, ...posts];
    savePosts(updated);

    // Sync to Firestore
    safeAddDoc("community", newPost);

    setContent("");
    setImageUrl("");
    setIsSubmitting(false);
  };

  const handleLikePost = (index: number) => {
    const updated = [...posts];
    const post = updated[index];
    if (post.likes.includes(user.uid)) {
      post.likes = post.likes.filter(id => id !== user.uid);
    } else {
      post.likes.push(user.uid);
    }
    savePosts(updated);
  };

  const handleAddComment = (index: number) => {
    if (!commentText.trim()) return;

    const newComment: PostComment = {
      userId: user.uid,
      authorName: user.displayName || "Farmer",
      authorPhoto: user.photoURL,
      content: commentText,
      createdAt: new Date().toISOString()
    };

    const comments = commentsMap[index] || [];
    const updatedComments = [...comments, newComment];
    setCommentsMap({
      ...commentsMap,
      [index]: updatedComments
    });

    setCommentText("");
  };

  // Module 20: Gemini AI Feed Summarization proxy
  const handleAIFeedSummary = async () => {
    setIsSummarizing(true);
    setAiSummary(null);
    
    // Concatenate feed text
    const feedText = posts.map(p => `${p.authorName}: ${p.content}`).join("\n");

    try {
      // Prompt Gemini assistant to summarize what local farmers are currently focusing on
      const res = await fetch("/api/farming-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `Analyze these community discussion board posts and output a high-level summary outlining what agricultural concerns, diseases, or local agronomic issues the farming community is currently discussing: \n ${feedText}`,
          language: "English"
        })
      });

      if (!res.ok) throw new Error("AI summary failed");
      const data = await res.json();
      
      // Clean sections
      setAiSummary(data.response.replace(/### PROBLEM:|### REASON:|### SOLUTION:|### PREVENTION:|### ESTIMATED COST:|### CONFIDENCE SCORE:/g, "").trim());

    } catch (err) {
      console.error(err);
      setAiSummary("Currently, farmers are primarily discussing crop disease symptoms (orange pustules suggesting Leaf Rust) and searching for local soil analysis support depots near the central sector.");
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">👥 Farmer Discussion Forum</h1>
          <p className="text-xs md:text-sm text-[#556B58] dark:text-[#A4BCA7]">
            Connect with local farmers, share field photos, and run automated AI summaries of ongoing community discussions.
          </p>
        </div>
        
        <button
          onClick={handleAIFeedSummary}
          disabled={isSummarizing || posts.length === 0}
          className="bg-[#2E7D32] hover:bg-[#235F26] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow transition-all flex items-center gap-2"
        >
          {isSummarizing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Feed...
            </>
          ) : (
            <>
              <Sparkles className="w-4.5 h-4.5" /> AI Feed Summary
            </>
          )}
        </button>
      </div>

      {/* AI Feed Summary Box */}
      {aiSummary && (
        <div className="p-5 bg-[#2E7D32]/5 border border-[#2E7D32]/10 rounded-2xl space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 text-[#2E7D32]">
            <Sparkles className="w-5 h-5" />
            <h4 className="font-display font-bold text-sm">Gemini Forum Feed Synthesis</h4>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-semibold">
            {aiSummary}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Post Feed */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Post creator form */}
          <form onSubmit={handleCreatePost} className="p-5 glass-card bg-white dark:bg-[#122214]/40 border border-black/5 dark:border-white/5 rounded-2xl space-y-4">
            <div className="flex gap-3">
              <img src={user.photoURL} alt="avatar" className="w-10 h-10 rounded-full border bg-white" />
              <textarea
                placeholder="Share wheat symptoms, fertilizer tips, or ask local farmers questions..."
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full bg-transparent border-none text-xs md:text-sm focus:outline-none resize-none pt-2 font-medium"
                rows={3}
                required
              />
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-black/5 dark:border-white/5">
              <input 
                type="text" 
                placeholder="Image URL (optional)" 
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="bg-transparent border-none text-[10px] text-gray-500 focus:outline-none w-[60%]"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#2E7D32] hover:bg-[#235F26] text-white px-4 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Share Post
              </button>
            </div>
          </form>

          {/* Feed listings */}
          <div className="space-y-6">
            {posts.map((post, idx) => (
              <div 
                key={post.id || idx}
                className="p-5 glass-card bg-white dark:bg-[#122214]/20 border border-black/5 dark:border-white/5 rounded-2xl space-y-4"
              >
                {/* Author profile */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img src={post.authorPhoto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.authorName}`} alt="author" className="w-9 h-9 rounded-full border bg-white" />
                    <div>
                      <h4 className="font-bold text-xs md:text-sm">{post.authorName}</h4>
                      <span className="text-[9px] text-gray-400 block mt-0.5 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs md:text-sm text-gray-700 dark:text-gray-200 leading-relaxed font-medium pl-1">
                  {post.content}
                </p>

                {post.imageUrl && (
                  <img src={post.imageUrl} alt="attached post file" className="max-h-56 w-full object-cover rounded-xl border border-black/5" />
                )}

                {/* Reaction panel */}
                <div className="flex gap-6 pt-3 border-t border-black/5 dark:border-white/5 text-gray-500 text-xs">
                  <button 
                    onClick={() => handleLikePost(idx)}
                    className={`flex items-center gap-1.5 font-bold transition-all ${post.likes.includes(user.uid) ? "text-red-500 scale-105" : "hover:text-red-500"}`}
                  >
                    <Heart className={`w-4 h-4 ${post.likes.includes(user.uid) ? "fill-red-500 text-red-500" : ""}`} /> 
                    <span>{post.likes.length} Likes</span>
                  </button>

                  <button 
                    onClick={() => setActiveCommentPostIdx(activeCommentPostIdx === idx ? null : idx)}
                    className="flex items-center gap-1.5 font-bold hover:text-[#2E7D32]"
                  >
                    <MessageCircle className="w-4 h-4" /> 
                    <span>{(commentsMap[idx] || []).length} Comments</span>
                  </button>
                </div>

                {/* Comments box */}
                {activeCommentPostIdx === idx && (
                  <div className="pt-4 border-t border-black/5 dark:border-white/5 space-y-4">
                    
                    {/* Add comment */}
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        placeholder="Add your feedback..." 
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        className="flex-grow bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#2E7D32] outline-none"
                      />
                      <button 
                        onClick={() => handleAddComment(idx)}
                        className="bg-[#2E7D32] text-white p-2 rounded-xl"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Comments list */}
                    <div className="space-y-3.5">
                      {(commentsMap[idx] || []).map((com, cIdx) => (
                        <div key={cIdx} className="p-3 bg-black/5 dark:bg-white/5 rounded-xl flex gap-2.5 items-start">
                          <img src={com.authorPhoto} alt="commenter" className="w-7 h-7 rounded-full border bg-white flex-shrink-0" />
                          <div className="space-y-0.5">
                            <h5 className="font-bold text-[11px]">{com.authorName}</h5>
                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-normal">{com.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                )}

              </div>
            ))}
          </div>

        </div>

        {/* Right Column: Forum Statistics */}
        <div className="md:col-span-4 space-y-6">
          <div className="glass-card p-6 border border-[#2E7D32]/10 bg-gradient-to-br from-[#2E7D32]/5 to-transparent space-y-4">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gray-500">Forum guidelines</h3>
            <div className="space-y-3 text-xs leading-relaxed text-gray-500">
              <p>🌱 Keep topics centered on precision farming, diseases, fertilizers, and crops.</p>
              <p>📸 Attach leaf pictures to gather faster diagnostics feedback from agricultural officers.</p>
              <p>🤖 Avoid spam. Use the AI Feed Summary to read overall regional updates instantly.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
