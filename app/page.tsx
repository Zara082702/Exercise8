"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  MessageSquare, LayoutDashboard, LogOut, Plus, Search, X,
  MapPin, AlertCircle, User, Image, Camera, FileText, Eye
} from 'lucide-react';

interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  location?: string;
  author_id: number;
  email: string;
  display_name: string;
  profile_picture_url?: string;
  image_url?: string;
  created_at?: string;
}

interface Comment {
  id: number;
  post_id: number;
  author_id: number;
  content: string;
  email: string;
  display_name: string;
  profile_picture_url?: string;
  created_at: string;
}

export default function NeighborNotes() {
  const { user, loading: authLoading, logout } = useAuth(); 
  const router = useRouter();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('All');
  const [comments, setComments] = useState<{[postId: number]: Comment[]}>({});
  const [showComments, setShowComments] = useState<{[postId: number]: boolean}>({});
  const [newComment, setNewComment] = useState('');
  const [commentingOn, setCommentingOn] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'General',
    location: '',
    image_url: '',
    author_email: user?.email || '' 
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      setNewPost(prev => ({ ...prev, author_email: user.email! }));
    }
  }, [user, authLoading, router]);

  // --- Data Fetching ---
  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (!res.ok) {
        throw new Error(`Failed to fetch posts: ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error("Failed to fetch posts:", error);
      setError('Failed to load posts. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...newPost, author_email: user.email!}),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create post');
      }
      
      setNewPost({
        title: '',
        content: '',
        category: 'General',
        location: '',
        image_url: '',
        author_email: user.email || ''
      });
      setShowModal(false);
      fetchPosts();
    } catch (error: any) {
      console.error("Error posting:", error);
      setError(error.message || 'Failed to create post. Please try again.');
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!user) return;

    setUploadingImage(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userEmail', user.email!);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await res.json();
      setNewPost(prev => ({ ...prev, image_url: data.url }));
    } catch (error: any) {
      console.error("Upload error:", error);
      setError(error.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchComments = async (postId: number) => {
    try {
      const res = await fetch(`/api/comments?postId=${postId}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch comments: ${res.status}`);
      }
      const data = await res.json();
      setComments(prev => ({ ...prev, [postId]: data }));
    } catch (error: any) {
      console.error("Failed to fetch comments:", error);
      setError('Failed to load comments. Please try again.');
    }
  };

  const handleAddComment = async (postId: number) => {
    if (!user || !newComment.trim()) return;

    setError(null);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          content: newComment.trim(),
          author_email: user.email!
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add comment');
      }

      setNewComment('');
      setCommentingOn(null);
      await fetchComments(postId);
    } catch (error: any) {
      console.error("Error adding comment:", error);
      setError(error.message || 'Failed to add comment. Please try again.');
    }
  };

  const toggleComments = async (postId: number) => {
    const currentlyShowing = showComments[postId];
    setShowComments(prev => ({ ...prev, [postId]: !currentlyShowing }));

    if (!currentlyShowing && !comments[postId]) {
      await fetchComments(postId);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'Event': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Lost & Found': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Service': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const filteredPosts = filter === 'All' 
    ? posts 
    : posts.filter(p => p.category === filter);
    
  if (authLoading || !user) {
    return <div className="text-center py-20 text-stone-500">Authenticating...</div>;
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800"
         style={{
           backgroundImage: `url('https://marketplace.canva.com/EAGEncMdbEM/1/0/1600w/canva-beige-brown-simple-abstract-desktop-wallpaper-pE_Ruap0PiI.jpg')`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat'
         }}>
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/10"></div>

      {/* Header */}
      <header className="bg-emerald-600 text-white shadow-lg sticky top-0 z-10 relative">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-white p-2 rounded-lg text-emerald-600">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">NeighborNotes <span className="text-sm font-normal opacity-75 ml-2">(Authenticated)</span></h1>
          </div>
          
          <div className="flex items-center space-x-3">
             <span className="text-sm font-medium hidden sm:inline-block">
                Logged in as: {user.email}
             </span>
             
             {/* Dashboard Button */}
             <button 
                onClick={() => router.push('/dashboard')}
                className="bg-emerald-700 text-white px-3 py-2 rounded-lg font-bold shadow-md hover:bg-emerald-800 transition-all flex items-center gap-2 text-sm"
            >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
            </button>
            
             {/* Logout Button */}
             <button 
                onClick={logout}
                className="bg-red-500 text-white px-3 py-2 rounded-lg font-bold shadow-md hover:bg-red-600 transition-all flex items-center gap-2 text-sm"
            >
                <LogOut className="w-4 h-4" />
                Logout
            </button>

            <button 
                onClick={() => setShowModal(true)}
                className="bg-white text-emerald-700 px-4 py-2 rounded-full font-bold shadow-md hover:bg-emerald-50 hover:shadow-lg transition-all flex items-center gap-2"
            >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Post Note</span>
                <span className="sm:hidden">Post</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-5xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['All', 'General', 'Event', 'Lost & Found', 'Service', 'Urgent'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === cat ? 'bg-stone-800 text-white shadow-md' : 'bg-white text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="text-center py-20 text-stone-400">Loading posts from database...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.length === 0 ? (
              <div className="col-span-full text-center py-20 text-stone-400">
                <p className="text-lg">No posts found matching current filter.</p>
              </div>
            ) : (
              filteredPosts.map(post => (
                <div key={post.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-stone-100 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </span>
                  </div>

                  {post.image_url && (
                    <div className="mb-4">
                      <img
                        src={post.image_url}
                        alt="Post image"
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-stone-800 mb-2">{post.title}</h3>
                  <p className="text-stone-600 mb-6 flex-grow whitespace-pre-wrap text-sm">{post.content}</p>

                  <div className="pt-4 border-t border-stone-100 flex flex-col gap-2 text-xs text-stone-400">
                    {post.location && (
                      <div className="flex items-center gap-1 text-stone-500">
                        <MapPin className="w-3 h-3" />
                        {post.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-stone-400" />
                        Posted by
                        <button
                          onClick={() => router.push(`/profile?email=${post.email}`)}
                          className={`font-medium hover:underline ${
                            post.email === user.email ? 'text-emerald-600 font-bold' : 'text-stone-700'
                          }`}
                        >
                          {post.email === user.email ? 'You' : (post.display_name || post.email)}
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center gap-1 text-stone-500 hover:text-stone-700 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        {showComments[post.id] ? 'Hide Comments' : 'Show Comments'}
                      </button>
                      <span className="text-stone-400">
                        {comments[post.id]?.length || 0} comments
                      </span>
                    </div>
                  </div>

                  {showComments[post.id] && (
                    <div className="mt-4 pt-4 border-t border-stone-100">
                      {comments[post.id]?.map(comment => (
                        <div key={comment.id} className="mb-3 p-3 bg-stone-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                              <User className="w-3 h-3 text-emerald-600" />
                            </div>
                            <span className="text-xs font-medium text-stone-700">
                              {comment.display_name || comment.email}
                            </span>
                            <span className="text-xs text-stone-400">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-stone-600">{comment.content}</p>
                        </div>
                      ))}

                      <div className="mt-3">
                        {commentingOn === post.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Write a comment..."
                              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg resize-none"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAddComment(post.id)}
                                className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700"
                              >
                                Comment
                              </button>
                              <button
                                onClick={() => {
                                  setCommentingOn(null);
                                  setNewComment('');
                                }}
                                className="px-3 py-1 bg-stone-200 text-stone-700 text-sm rounded-lg hover:bg-stone-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setCommentingOn(post.id)}
                            className="text-sm text-emerald-600 hover:text-emerald-800"
                          >
                            Add a comment
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Modal for Posting New Post */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-800"><X className="w-6 h-6" /></button>
            <h2 className="text-2xl font-bold text-stone-800 mb-6">Create New Post</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="bg-blue-50 text-blue-700 p-3 rounded-lg border border-blue-200 text-sm flex items-center gap-2">
                 <User className="w-4 h-4" /> Posting as: <span className="font-semibold">{user.email}</span>
              </div>
              
              <input
                required
                type="text"
                placeholder="Post Title"
                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors"
                value={newPost.title}
                onChange={e => setNewPost({...newPost, title: e.target.value})}
              />

              <div className="grid grid-cols-2 gap-4">
                <select
                  className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors"
                  value={newPost.category}
                  onChange={e => setNewPost({...newPost, category: e.target.value})}
                >
                  <option>General</option><option>Event</option><option>Lost & Found</option><option>Service</option><option>Urgent</option>
                </select>
                <input
                  type="text"
                  placeholder="Location (optional)"
                  className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors"
                  value={newPost.location}
                  onChange={e => setNewPost({...newPost, location: e.target.value})}
                />
              </div>

              <textarea
                required
                rows={4}
                placeholder="What's happening in your neighborhood?"
                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors resize-none"
                value={newPost.content}
                onChange={e => setNewPost({...newPost, content: e.target.value})}
              />

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-700">Add an Image (optional)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file);
                      }
                    }}
                    className="hidden"
                    id="image-upload"
                    disabled={uploadingImage}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                      uploadingImage
                        ? 'bg-stone-100 border-stone-200 text-stone-400'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {uploadingImage ? (
                      <>
                        <div className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4" />
                        Choose Image
                      </>
                    )}
                  </label>
                  {newPost.image_url && (
                    <button
                      type="button"
                      onClick={() => setNewPost(prev => ({ ...prev, image_url: '' }))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {newPost.image_url && (
                  <div className="mt-2">
                    <img
                      src={newPost.image_url}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg border border-stone-200"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={uploadingImage}
              >
                {uploadingImage ? 'Uploading...' : 'Create Post'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}