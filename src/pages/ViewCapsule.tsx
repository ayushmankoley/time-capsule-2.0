import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, Lock, Image, FileText, Mic, Film, Trash2, Download, LockIcon, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface CapsuleContent {
  id: string;
  content_type: 'image' | 'document' | 'audio' | 'video';
  url: string;
  title: string;
  file_name?: string;
}

interface Capsule {
  id: string;
  title: string;
  description: string;
  unlock_date: string;
  is_private: boolean;
  user_id: string;
  collaborators: string[];
  contents: CapsuleContent[];
}

const ViewCapsule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const fetchCapsule = async () => {
      try {
        const { data: capsuleData, error: capsuleError } = await supabase
          .from('capsules')
          .select('*, capsule_contents(*)')
          .eq('id', id)
          .single();

        if (capsuleError) throw capsuleError;
        if (!capsuleData) throw new Error('Capsule not found');

        const unlockDate = new Date(capsuleData.unlock_date);
        const now = new Date();
        const isUnlocked = now >= unlockDate;
        setIsUnlocked(isUnlocked);

        let contentsWithUrls = capsuleData.capsule_contents;
        if (isUnlocked) {
          contentsWithUrls = await Promise.all(
            (capsuleData.capsule_contents || []).map(async (content: CapsuleContent) => {
              if (!content.url) return content;

              try {
                const cleanUrl = content.url.split('?')[0];
                
                const { data: signedData, error: signedError } = await supabase.storage
                  .from('capsule-content')
                  .createSignedUrl(cleanUrl, 3600);

                if (signedError) return content;

                return {
                  ...content,
                  url: signedData?.signedUrl || content.url
                };
              } catch (error) {
                console.error('Error getting signed URL:', error);
                return content;
              }
            })
          );
        }

        // Set the cover image to the first image in the capsule contents
        const coverImage = contentsWithUrls.find((content: CapsuleContent) => content.content_type === 'image');
        let coverImageUrl = coverImage?.url || '/default-cover.jpg'; // Fallback to default if no image found

        setCapsule({
          ...capsuleData,
          contents: contentsWithUrls,
          collaborators: capsuleData.collaborators || []
        });

        const headerImage = document.querySelector('.cover-image') as HTMLImageElement;
        if (headerImage) {
          headerImage.src = coverImageUrl;
        }

      } catch (err) {
        console.error('Error fetching capsule:', err);
        setError(err instanceof Error ? err.message : 'Failed to load capsule');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCapsule();
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      if (!capsule) return;

      for (const content of capsule.contents) {
        if (content.url) {
          const { error: storageError } = await supabase.storage
            .from('capsule-content')
            .remove([content.url]);
          
          if (storageError) {
            console.error('Error deleting content from storage:', storageError);
          }
        }
      }

      const { error: deleteError } = await supabase
        .from('capsules')
        .delete()
        .eq('id', capsule.id);

      if (deleteError) throw deleteError;

      navigate('/dashboard');
    } catch (err) {
      console.error('Error deleting capsule:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete capsule');
    }
  };

  const handleDownload = async (content: CapsuleContent) => {
    try {
      const fullPath = content.url.split('?')[0];
      const relativePath = fullPath.split('capsule-content/')[1];
      
      if (!relativePath) {
        throw new Error('Invalid file path');
      }

      const { data, error } = await supabase.storage
        .from('capsule-content')
        .createSignedUrl(relativePath, 60);

      if (error) throw error;
      
      if (data?.signedUrl) {
        const response = await fetch(data.signedUrl);
        const blob = await response.blob();
        
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = content.file_name || content.title || 'download';
        link.click();
        
        window.URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (error || !capsule) {
    return <div className="text-center text-red-500 p-8">{error || 'Capsule not found'}</div>;
  }

  if (!isUnlocked) {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 text-center"
        >
          <LockIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Time Capsule Locked</h2>
          <p className="text-gray-600 mb-4">
            This capsule will unlock on {new Date(capsule?.unlock_date || '').toLocaleDateString()}
          </p>
          <div className="text-sm text-gray-500">
            {capsule?.description}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mt-4"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Dashboard</span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="relative h-64">
          <img
            className="cover-image w-full h-full object-cover"
            src="/default-cover.jpg"
            alt={capsule.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{capsule.title}</h1>
            <p className="text-lg opacity-90">{capsule.description}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">Opens {new Date(capsule.unlock_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">{capsule.collaborators.length} collaborators</span>
              </div>
              {capsule.is_private && (
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">Private</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-5 w-5" />
              <span>Delete Capsule</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <button className="flex items-center justify-center space-x-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Image className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">Photos</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <FileText className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">Documents</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Mic className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">Audio</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Film className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">Videos</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {capsule.contents.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-lg overflow-hidden shadow-md"
              >
                {item.content_type === 'image' ? (
                  <div className="relative h-48">
                    <img
                      src={item.url || '/placeholder-image.jpg'}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : item.content_type === 'video' ? (
                  <div className="relative">
                    <video
                      src={item.url}
                      controls
                      className="w-full h-48 object-cover"
                    />
                  </div>
                ) : item.content_type === 'audio' ? (
                  <div className="relative bg-gray-100 p-4">
                    <audio
                      src={item.url}
                      controls
                      className="w-full mt-4"
                    />
                  </div>
                ) : (
                  <div className="relative h-48 flex items-center justify-center bg-gray-100">
                    <FileText className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.content_type.charAt(0).toUpperCase() + item.content_type.slice(1)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(item)}
                      className="bg-gray-100 text-gray-800 p-2 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

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
                onClick={() => setShowDeleteConfirm(false)}
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

export default ViewCapsule;