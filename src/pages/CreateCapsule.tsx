import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Lock, Image, FileText, Mic, Film } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface FileUpload {
  file: File;
  type: 'image' | 'document' | 'audio' | 'video';
}

const CreateCapsule = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    unlockDate: '',
    isPrivate: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore(state => state.user);
  const [selectedType, setSelectedType] = useState<'image' | 'document' | 'audio' | 'video' | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleRemoveFile = (index: number) => {
    setUploads(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
  
      const { data: capsule, error: capsuleError } = await supabase
        .from('capsules')
        .insert({
          title: formData.title,
          description: formData.description,
          unlock_date: formData.unlockDate,
          is_private: formData.isPrivate,
          user_id: user.id,
          created_by: user.id
        })
        .select()
        .single();
  
      if (capsuleError) throw capsuleError;
  
      if (uploads.length > 0) {
        await Promise.all(
          uploads.map(async (upload) => {
            const fileExt = upload.file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
            const filePath = `${capsule.id}/${upload.type}s/${fileName}`;
  
            try {
              const { error: uploadError } = await supabase.storage
                .from('capsule-content')
                .upload(filePath, upload.file);
  
              if (uploadError) throw uploadError;

              const { error: contentError } = await supabase
                .from('capsule_contents')
                .insert({
                  capsule_id: capsule.id,
                  content_type: upload.type,
                  title: upload.file.name,
                  description: '',
                  url: filePath,
                  created_by: user.id
                });
  
              if (contentError) {
                console.error('Content Error:', contentError);
                throw contentError;
              }
            } catch (error) {
              console.error('Error processing file:', upload.file.name, error);
              throw error;
            }
          })
        );
      }
  
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating capsule:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while creating the capsule');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!selectedType) return;
      
      const files = Array.from(e.target.files || []);
      const newUploads = files.map(file => ({
        file,
        type: selectedType
      }));

      setUploads(prev => [...prev, ...newUploads]);
      setSelectedType(null);
    } catch (error) {
      console.error('Error selecting files:', error);
      setError(error instanceof Error ? error.message : 'Error selecting files');
    }
  };

  const handleContentTypeClick = (type: 'image' | 'document' | 'audio' | 'video') => {
    setSelectedType(type);
    fileInputRef.current?.click();
  };

  const contentTypes = [
    { icon: Image, label: 'Photos', type: 'image' as const },
    { icon: FileText, label: 'Documents', type: 'document' as const },
    { icon: Mic, label: 'Audio', type: 'audio' as const },
    { icon: Film, label: 'Videos', type: 'video' as const }
  ];

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    setStep(2);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Time Capsule</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capsule Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unlock Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    value={formData.unlockDate}
                    onChange={(e) => setFormData({ ...formData, unlockDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">Private Capsule</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPrivate}
                    onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Add Content</h2>
              <div className="grid grid-cols-2 gap-4">
                {contentTypes.map((type) => (
                  <button
                    key={type.label}
                    type="button"
                    onClick={() => handleContentTypeClick(type.type as any)}
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <type.icon className="h-8 w-8 text-gray-400" />
                    <span className="mt-2 text-sm font-medium text-gray-700">{type.label}</span>
                  </button>
                ))}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />

              {uploads.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Selected Files:</h3>
                  <ul className="space-y-2">
                    {uploads.map((upload, index) => (
                      <li 
                        key={index} 
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm text-gray-600">
                          {upload.file.name} ({upload.type})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={step === 1 ? handleNextStep : handleSubmit}
              className="ml-auto bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              disabled={isSubmitting}
            >
              {step === 2 ? 'Create Capsule' : 'Next'}
            </button>
          </div>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </form>
      </motion.div>
    </div>
  );
};

export default CreateCapsule;