export interface RoomData {
  id: number;
  title: string;
  image: string;
  price: number;
  location: string;
  rating: number;
  type?: string;
  description?: string;
  amenities?: string[];
  image_url?: string;
  host_name?: string;
  host_contact?: string;
}
