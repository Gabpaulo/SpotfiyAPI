export interface LibraryItem {
  id: string;
  type: 'local'|'spotify'|'preview';
  name: string;
  url?: string;
  uri?: string;
  thumbnail?: string;
  artists?: string[];
}