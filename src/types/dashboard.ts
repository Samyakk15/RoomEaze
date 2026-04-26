export interface StayRequest {
  id: string;
  room_id: string;
  student_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string;
  rooms?: {
    title: string;
  };
}

export interface SavedRoom {
  id: string;
  user_id: string;
  room_id: string;
  created_at: string;
  rooms?: {
    id: string;
    title: string;
    price: number;
    location: string;
    image_url?: string;
  };
}
