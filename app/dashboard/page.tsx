"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { LayoutDashboard, MessageSquare, MapPin, Calendar, User, Trash2, ArrowLeft } from 'lucide-react';

// Define Post interface (updated from Note)
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

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  // 1. Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

// 2. Fetch Posts and Filter by Current User
  useEffect(() => {
    const fetchAndFilterPosts = async () => {
      if (!user) return;
      
      try {
        // Fetch all posts from the API route
        const res = await fetch('/api/posts');
        
        // Ensure response is successful
        if (!res.ok) {
            throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        
        // ** THE FIX **: Ensure data is an array. 
        // Handles cases where API returns just an array, or an object like { posts: [...] } or { data: [...] }
        const allPosts = Array.isArray(data) ? data : data.posts || data.data || [];
        
        // Final safety check to ensure we are working with an array
        if (!Array.isArray(allPosts)) {
             console.error("API response is not a valid array structure. Received:", data);
             setMyPosts([]);
             return;
        }

        // Filter posts by the current Firebase User's email
        const filtered = allPosts.filter((post: Post) => post.email === user.email);
        
        setMyPosts(filtered);
      } catch (error) {
        console.error("Failed to fetch dashboard posts:", error);
        setMyPosts([]); // Reset posts on error
      } finally {
        setPostsLoading(false);
      }
    };

    if (user) {
      fetchAndFilterPosts();
    }
  }, [user]);
  
  // Helper for colors
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'Event': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Lost & Found': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Service': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  if (authLoading || !user) {
    return <div className="text-center py-20 text-stone-500">Authenticating...</div>;
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800 p-4 sm:p-8"
         style={{
           backgroundImage: `url('https://marketplace.canva.com/EAGEncMdbEM/1/0/1600w/canva-beige-brown-simple-abstract-desktop-wallpaper-pE_Ruap0PiI.jpg')`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat'
         }}>
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-700 flex items-center gap-3 mb-8">
          <LayoutDashboard className="w-7 h-7" />
          Your Personal Dashboard
        </h1>

        <div className="bg-white p-6 rounded-xl shadow-md border border-stone-100 mb-8">
          <p className="text-lg font-semibold text-stone-700 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            Logged in as: <span className="text-emerald-700 font-bold">{user.email}</span>
          </p>
          <p className="text-sm text-stone-500 mt-1">
            This section shows only the notes you have posted.
          </p>
        </div>
        
        <h2 className="text-2xl font-semibold mb-6 text-stone-800">Your Posted Posts ({myPosts.length})</h2>

        {postsLoading ? (
          <div className="text-center py-10 text-stone-400">Loading your posts...</div>
        ) : myPosts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl shadow-inner border border-stone-200">
            <p className="text-lg text-stone-500">You haven't posted any posts yet.</p>
            <button 
                onClick={() => router.push('/')}
                className="mt-4 text-emerald-600 hover:text-emerald-800 flex items-center justify-center mx-auto"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Go to Main Board to Post
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPosts.map(post => (
              <div key={post.id} className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 flex flex-col h-full">
                <span className={`mb-3 px-2 py-1 rounded text-xs font-semibold self-start ${getCategoryColor(post.category)}`}>
                  {post.category}
                </span>

                {post.image_url && (
                  <div className="mb-4">
                    <img
                      src={post.image_url}
                      alt="Post image"
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <h3 className="text-xl font-bold text-stone-800 mb-2">{post.title}</h3>
                <p className="text-stone-600 mb-4 flex-grow whitespace-pre-wrap text-sm">{post.content}</p>
                <div className="pt-3 border-t border-stone-100 flex justify-between items-center text-xs text-stone-400">
                    <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {post.location || 'Local Area'}
                    </div>
                    {/* Placeholder for Delete Button: Note: Deletion API is not implemented yet */}
                    {/* <button className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button> */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}