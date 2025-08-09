export function getCategoryBadgeClass(category: string | null | undefined): string {
  const key = (category || '').toLowerCase().trim();
  switch (key) {
    case 'prevention':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'actualites':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'recherche':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'formation':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'conseils':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}