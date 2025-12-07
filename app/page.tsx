"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth'; 
import { 
  MessageSquare, LayoutDashboard, LogOut, Plus, Search, X, 
  MapPin, AlertCircle, User
} from 'lucide-react';

interface Note {
  id: number;
  title: string;
  content: string;
  category: string;
  location?: string;
  author_name: string;
  created_at?: string;
}

export default function NeighborNotes() {
  const { user, loading: authLoading, logout } = useAuth(); 
  const router = useRouter();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('All');
  
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'General',
    location: '',
    author_name: user?.email || '' 
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      setNewNote(prev => ({ ...prev, author_name: user.email! }));
    }
  }, [user, authLoading, router]);

  // --- Data Fetching ---
  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotes(data);
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return; 

    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...newNote, author_name: user.email!}), 
      });
      
      setNewNote({ title: '', content: '', category: 'General', location: '', author_name: user.email || '' });
      setShowModal(false);
      fetchNotes(); 
    } catch (error) {
      console.error("Error posting note:", error);
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

  const filteredNotes = filter === 'All' 
    ? notes 
    : notes.filter(n => n.category === filter);
    
  if (authLoading || !user) {
    return <div className="text-center py-20 text-stone-500">Authenticating...</div>;
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800">
      {/* Header */}
      <header className="bg-emerald-600 text-white shadow-lg sticky top-0 z-10">
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
      <main className="max-w-5xl mx-auto px-4 py-8">
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

        {/* Notes Grid */}
        {loading ? (
          <div className="text-center py-20 text-stone-400">Loading notes from MySQL...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.length === 0 ? (
              <div className="col-span-full text-center py-20 text-stone-400">
                <p className="text-lg">No notes found matching current filter.</p>
              </div>
            ) : (
              filteredNotes.map(note => (
                <div key={note.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-stone-100 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getCategoryColor(note.category)}`}>
                      {note.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-2">{note.title}</h3>
                  <p className="text-stone-600 mb-6 flex-grow whitespace-pre-wrap text-sm">{note.content}</p>
                  <div className="pt-4 border-t border-stone-100 flex flex-col gap-2 text-xs text-stone-400">
                    {note.location && (
                      <div className="flex items-center gap-1 text-stone-500">
                        <MapPin className="w-3 h-3" />
                        {note.location}
                      </div>
                    )}
                    <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-stone-400" />
                        Posted by 
                        <span className={`font-medium ${note.author_name === user.email ? 'text-emerald-600 font-bold' : 'text-stone-700'}`}>
                            {note.author_name === user.email ? 'You' : note.author_name}
                        </span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Modal for Posting New Note */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-800"><X className="w-6 h-6" /></button>
            <h2 className="text-2xl font-bold text-stone-800 mb-6">New Note</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="bg-blue-50 text-blue-700 p-3 rounded-lg border border-blue-200 text-sm flex items-center gap-2">
                 <User className="w-4 h-4" /> Posting as: <span className="font-semibold">{user.email}</span>
              </div>
              
              <input required type="text" placeholder="Title" className="w-full px-4 py-2 rounded-lg border border-stone-200" value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <select className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-white" value={newNote.category} onChange={e => setNewNote({...newNote, category: e.target.value})}>
                  <option>General</option><option>Event</option><option>Lost & Found</option><option>Service</option><option>Urgent</option>
                </select>
                <input type="text" placeholder="Location" className="w-full px-4 py-2 rounded-lg border border-stone-200" value={newNote.location} onChange={e => setNewNote({...newNote, location: e.target.value})} />
              </div>
              
              <textarea required rows={4} placeholder="Content..." className="w-full px-4 py-2 rounded-lg border border-stone-200" value={newNote.content} onChange={e => setNewNote({...newNote, content: e.target.value})}></textarea>
              <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700">Post Note</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}