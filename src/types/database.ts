export interface Capsule {
  id: string;
  title: string;
  description: string | null;
  unlock_date: string;
  is_private: boolean;
  allow_collaborators: boolean;
  created_at: string;
  created_by: string;
  cover_image: string | null;
}

export interface CapsuleContent {
  id: string;
  capsule_id: string;
  content_type: 'text' | 'image' | 'video' | 'audio' | 'document';
  title: string;
  description: string | null;
  url: string | null;
  created_at: string;
  created_by: string;
}

export interface CapsuleCollaborator {
  capsule_id: string;
  user_id: string;
  role: 'viewer' | 'contributor';
  added_at: string;
}