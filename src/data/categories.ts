export const categories = [
  { id: 'chatgpt', name: 'ChatGPT', icon: '💬', color: 'from-emerald-500 to-teal-500' },
  { id: 'midjourney', name: 'Midjourney', icon: '🎨', color: 'from-pink-500 to-rose-500' },
  { id: 'claude', name: 'Claude', icon: '🧠', color: 'from-orange-500 to-amber-500' },
  { id: 'stable-diffusion', name: 'Stable Diffusion', icon: '🖼️', color: 'from-violet-500 to-purple-500' },
  { id: 'business', name: 'Business', icon: '💼', color: 'from-blue-500 to-cyan-500' },
  { id: 'marketing', name: 'Marketing', icon: '📈', color: 'from-green-500 to-emerald-500' },
  { id: 'coding', name: 'Coding', icon: '💻', color: 'from-indigo-500 to-blue-500' },
  { id: 'creative', name: 'Creative Writing', icon: '✍️', color: 'from-fuchsia-500 to-pink-500' },
];

export const getCategoryName = (categoryId: string): string => {
  const category = categories.find(c => c.id === categoryId);
  return category?.name || categoryId;
};
