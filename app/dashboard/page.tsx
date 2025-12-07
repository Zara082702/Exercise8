"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { LayoutDashboard, MessageSquare, MapPin, Calendar, User, Trash2, ArrowLeft } from 'lucide-react';

// Define Note interface (same as in app/page.tsx)
interface Note {
  id: number;
  title: string;
  content: string;
  category: string;
  location?: string;
  author_name: string;
  created_at?: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [myNotes, setMyNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);

  // 1. Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // 2. Fetch Notes and Filter by Current User
  useEffect(() => {
    const fetchAndFilterNotes = async () => {
      if (!user) return;
      
      try {
        // Fetch all notes from the MySQL API route
        const res = await fetch('/api/notes');
        
        // Ensure response is successful
        if (!res.ok) {
            throw new Error(`Failed to fetch notes: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        
        // ** THE FIX **: Ensure data is an array. 
        // Handles cases where API returns just an array, or an object like { notes: [...] } or { data: [...] }
        const allNotes = Array.isArray(data) ? data : data.notes || data.data || [];

        // Final safety check to ensure we are working with an array
        if (!Array.isArray(allNotes)) {
             console.error("API response is not a valid array structure. Received:", data);
             setMyNotes([]);
             return;
        }

        // Filter notes by the current Firebase User's email
        const filtered = allNotes.filter((note: Note) => note.author_name === user.email);
        
        setMyNotes(filtered);
      } catch (error) {
        console.error("Failed to fetch dashboard notes:", error);
        setMyNotes([]); // Reset notes on error
      } finally {
        setNotesLoading(false);
      }
    };

    if (user) {
      fetchAndFilterNotes();
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
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
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
        
        <h2 className="text-2xl font-semibold mb-6 text-stone-800">Your Posted Notes ({myNotes.length})</h2>

        {notesLoading ? (
          <div className="text-center py-10 text-stone-400">Loading your notes...</div>
        ) : myNotes.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl shadow-inner border border-stone-200">
            <p className="text-lg text-stone-500">You haven't posted any notes yet.</p>
            <button 
                onClick={() => router.push('/')}
                className="mt-4 text-emerald-600 hover:text-emerald-800 flex items-center justify-center mx-auto"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Go to Main Board to Post
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myNotes.map(note => (
              <div key={note.id} className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 flex flex-col h-full">
                <span className={`mb-3 px-2 py-1 rounded text-xs font-semibold self-start ${getCategoryColor(note.category)}`}>
                  {note.category}
                </span>
                <h3 className="text-xl font-bold text-stone-800 mb-2">{note.title}</h3>
                <p className="text-stone-600 mb-4 flex-grow whitespace-pre-wrap text-sm">{note.content}</p>
                <div className="pt-3 border-t border-stone-100 flex justify-between items-center text-xs text-stone-400">
                    <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {note.location || 'Local Area'}
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