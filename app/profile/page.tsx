"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { ArrowLeft, User, MapPin, Calendar, Edit3, Upload, FileText } from 'lucide-react';

interface UserProfile {
  id: number;
  email: string;
  display_name?: string;
  profile_picture_url?: string;
  bio?: string;
  created_at: string;
  posts_count: number;
}

interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  location?: string;
  image_url?: string;
  created_at: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileEmail = searchParams.get('email');

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: '',
    bio: '',
    profile_picture_url: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileEmail) return;

      try {
        const res = await fetch(`/api/users?email=${encodeURIComponent(profileEmail)}`);
        if (!res.ok) {
          throw new Error('Failed to fetch profile');
        }
        const profileData = await res.json();
        setProfile(profileData);

        // Fetch user's posts
        const postsRes = await fetch('/api/posts');
        if (postsRes.ok) {
          const allPosts = await postsRes.json();
          const filteredPosts = allPosts.filter((post: any) => post.email === profileEmail);
          setUserPosts(filteredPosts);
        }
      } catch (error: any) {
        console.error('Failed to fetch profile:', error);
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (profileEmail) {
      fetchProfile();
    }
  }, [profileEmail]);

  // Initialize edit form when profile loads
  useEffect(() => {
    if (profile) {
      setEditForm({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        profile_picture_url: profile.profile_picture_url || ''
      });
    }
  }, [profile]);

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
      setEditForm(prev => ({ ...prev, profile_picture_url: data.url }));
    } catch (error: any) {
      console.error("Upload error:", error);
      setError(error.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setError(null);
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email!,
          ...editForm
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      // Update local profile state
      setProfile(prev => prev ? {
        ...prev,
        display_name: editForm.display_name,
        bio: editForm.bio,
        profile_picture_url: editForm.profile_picture_url
      } : null);

      setIsEditing(false);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setError(error.message || 'Failed to update profile. Please try again.');
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

  if (authLoading || !user) {
    return <div className="text-center py-20 text-stone-500">Authenticating...</div>;
  }

  if (loading) {
    return <div className="text-center py-20 text-stone-500">Loading profile...</div>;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-stone-50 font-sans text-stone-800 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-stone-800 mb-4">Profile Not Found</h1>
            <p className="text-stone-600 mb-6">The user profile you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors"
            >
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = user.email === profile.email;

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-emerald-700">User Profile</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <div className="w-5 h-5 text-red-600">⚠️</div>
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md border border-stone-100 p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              {isEditing ? (
                <div className="relative">
                  <div className="w-24 h-24 bg-stone-200 rounded-full flex items-center justify-center overflow-hidden">
                    {editForm.profile_picture_url ? (
                      <img
                        src={editForm.profile_picture_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-stone-400" />
                    )}
                  </div>
                  <label
                    htmlFor="profile-pic-upload"
                    className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-2 rounded-full cursor-pointer hover:bg-emerald-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                  </label>
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
                    id="profile-pic-upload"
                    disabled={uploadingImage}
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-stone-200 rounded-full flex items-center justify-center overflow-hidden">
                  {profile.profile_picture_url ? (
                    <img
                      src={profile.profile_picture_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-stone-400" />
                  )}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-grow">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={editForm.display_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                      placeholder="Enter your display name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Bio</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 resize-none"
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-stone-200 text-stone-700 px-4 py-2 rounded-lg font-bold hover:bg-stone-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-stone-800">
                        {profile.display_name || profile.email.split('@')[0]}
                      </h2>
                      <p className="text-stone-600">{profile.email}</p>
                    </div>
                    {isOwnProfile && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                      </button>
                    )}
                  </div>

                  {profile.bio && (
                    <p className="text-stone-700 mb-4">{profile.bio}</p>
                  )}

                  <div className="flex items-center gap-6 text-sm text-stone-500">
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {profile.posts_count} posts
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {new Date(profile.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User's Posts */}
        <div>
          <h3 className="text-2xl font-semibold text-stone-800 mb-6">
            {isOwnProfile ? 'Your Posts' : `${profile.display_name || profile.email.split('@')[0]}'s Posts`}
          </h3>

          {userPosts.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl shadow-inner border border-stone-200">
              <p className="text-lg text-stone-500">
                {isOwnProfile ? "You haven't posted anything yet." : "No posts yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userPosts.map(post => (
                <div key={post.id} className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
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

                  <h4 className="text-lg font-bold text-stone-800 mb-2">{post.title}</h4>
                  <p className="text-stone-600 mb-4 whitespace-pre-wrap text-sm">{post.content}</p>

                  <div className="flex items-center justify-between text-xs text-stone-400">
                    {post.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {post.location}
                      </div>
                    )}
                    <span>{new Date(post.created_at!).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}