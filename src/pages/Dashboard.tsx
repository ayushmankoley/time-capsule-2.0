import { Link } from 'react-router-dom';
import { Plus, Clock, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

interface CapsuleContent {
  id: string;
  content_type: 'image' | 'document' | 'audio' | 'video';
  url: string;
  title: string;
}

interface Capsule {
  id: string;
  title: string;
  description: string;
  unlock_date: string;
  is_private: boolean;
  user_id: string;
  capsule_contents: CapsuleContent[];
  cover_image?: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
  };
}

const Dashboard = () => {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [publicCapsules, setPublicCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore(state => state.user);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [capsuleToDelete, setCapsuleToDelete] = useState<Capsule | null>(null);
  const navigate = useNavigate();

  const fetchCapsules = async () => {
    try {
      if (!user) return;

      const { data: userCapsules, error: userCapsulesError } = await supabase
        .from('capsules')
        .select('*, capsule_contents(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (userCapsulesError) throw userCapsulesError;

      const { data: publicCapsulesData, error: publicCapsulesError } = await supabase
        .from('capsules')
        .select(`
          *,
          capsule_contents(*)
        `)
        .eq('is_private', false)
        .order('created_at', { ascending: false });

      if (publicCapsulesError) throw publicCapsulesError;

      const processCovers = async (capsules: any[]) => {
        return Promise.all(
          capsules.map(async (capsule) => {
            const coverContent = capsule.capsule_contents?.find(
              (content: CapsuleContent, _index: number) => content.content_type === 'image'
            );

            if (coverContent?.url) {
              try {
                const { data: urlData } = await supabase.storage
                  .from('capsule-content')
                  .createSignedUrl(coverContent.url, 3600);

                return {
                  ...capsule,
                  cover_image: urlData?.signedUrl
                };
              } catch (error) {
                console.error('Error getting signed URL:', error);
                return capsule;
              }
            }
            return capsule;
          })
        );
      };

      const processedUserCapsules = await processCovers(userCapsules || []);
      const processedPublicCapsules = await processCovers(publicCapsulesData || []);

      setCapsules(processedUserCapsules);
      setPublicCapsules(processedPublicCapsules);

      console.log('Public Capsules:', processedPublicCapsules);
    } catch (err) {
      console.error('Error fetching capsules:', err);
      setError(err instanceof Error ? err.message : 'Failed to load capsules');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!capsuleToDelete) return;

    try {
      const { error: deleteError } = await supabase
        .from('capsules')
        .delete()
        .eq('id', capsuleToDelete.id);

      if (deleteError) throw deleteError;

      await fetchCapsules();
      setCapsuleToDelete(null);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Error deleting capsule:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete capsule');
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else {
      fetchCapsules();
    }
  }, [user, navigate]);

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">{error}</div>;
  }

  const renderCapsuleGrid = (capsuleList: Capsule[]) => (
    <div className="grid md:grid-cols-2 gap-6">
      {capsuleList.map((capsule, index) => (
        <motion.div
          key={capsule.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="relative h-48">
            <img
              src={
                capsule.capsule_contents.find(content => content.content_type === 'image')?.url || 'https://raw.githubusercontent.com/ayushmankoley/time-capsule-2.0/refs/heads/main/src/default-cover.jpeg'
              }
              alt={capsule.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">{capsule.title}</h3>
                {new Date(capsule.unlock_date) > new Date() && 
                  <Lock className="h-4 w-4" aria-label="Locked until unlock date" />
                }
              </div>
              <p className="text-sm opacity-90">{capsule.description}</p>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{new Date(capsule.unlock_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                {capsule.profiles?.full_name && (
                  <div className="text-gray-600">
                    Created by {capsule.profiles.full_name}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setShowDeleteConfirm(true);
                  setCapsuleToDelete(capsule);
                }}
                className="text-gray-600 hover:text-gray-800 text-sm"
                aria-label="Delete Capsule"
              >
                Delete
              </button>
            </div>
            {showDeleteConfirm && (
              <div className="text-red-500 text-sm">
                Are you sure you want to delete this capsule? This action cannot be undone.
              </div>
            )}
            <Link
              to={`/capsule/${capsule.id}`}
              className="mt-4 block text-center bg-gray-50 text-indigo-600 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              View Capsule
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="space-y-12">
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Time Capsules</h1>
          <Link
            to="/create"
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>New Capsule</span>
          </Link>
        </div>
        {renderCapsuleGrid(capsules)}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-8">My Publicly Shared Capsules</h2>
        {publicCapsules.length > 0 ? (
          renderCapsuleGrid(publicCapsules)
        ) : (
          <p className="text-gray-500 text-center py-8">
            No public capsules available at the moment.
          </p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Capsules Shared by Others</h2>
        {publicCapsules.filter(capsule => capsule.user_id !== user.id).length > 0 ? (
          renderCapsuleGrid(publicCapsules.filter(capsule => capsule.user_id !== user.id))
        ) : (
          <p className="text-gray-500 text-center py-8">
            Upcoming capsules shared by others will appear here.
          </p>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Capsule?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this time capsule? This action cannot be undone and all contents will be permanently deleted.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setCapsuleToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;