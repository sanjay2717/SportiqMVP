export interface Sport {
  id: string;
  name: string;
  icon: string;
}

export const SPORTS_LIST: Sport[] = [
  { id: 'cricket', name: 'Cricket', icon: 'sports_cricket' },
  { id: 'football', name: 'Football', icon: 'sports_soccer' },
  { id: 'kabaddi', name: 'Kabaddi', icon: 'sports_handball' },
  { id: 'kho_kho', name: 'Kho Kho', icon: 'directions_run' },
  { id: 'athletics', name: 'Athletics', icon: 'sprint' },
  { id: 'badminton', name: 'Badminton', icon: 'sports_tennis' },
  { id: 'table_tennis', name: 'Table Tennis', icon: 'sports_tennis' },
  { id: 'tennis', name: 'Tennis', icon: 'sports_tennis' },
  { id: 'hockey', name: 'Hockey', icon: 'sports_hockey' },
  { id: 'volleyball', name: 'Volleyball', icon: 'sports_volleyball' },
  { id: 'basketball', name: 'Basketball', icon: 'sports_basketball' },
  { id: 'swimming', name: 'Swimming', icon: 'pool' },
  { id: 'chess', name: 'Chess', icon: 'extension' },
  { id: 'silambam', name: 'Silambam', icon: 'sports_martial_arts' },
  { id: 'carrom', name: 'Carrom', icon: 'games' },
];

export function getSportById(id: string | null | undefined): Sport | undefined {
  if (!id) return undefined;
  return SPORTS_LIST.find(s => s.id === id);
}

export function getSportName(idOrName: string | null | undefined): string {
  if (!idOrName) return '';
  
  // Try matching by id first
  const sportById = SPORTS_LIST.find(s => s.id === idOrName);
  if (sportById) return sportById.name;
  
  // Then case-insensitive name match
  const lowerInput = idOrName.toLowerCase();
  const sportByName = SPORTS_LIST.find(s => s.name.toLowerCase() === lowerInput);
  if (sportByName) return sportByName.name;
  
  // Otherwise humanize
  return idOrName
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
