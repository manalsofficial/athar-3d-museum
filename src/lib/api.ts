import type { Contributor, Story, SearchResult } from '../types';

export async function searchPeople(query: string, language: 'en' | 'ar' = 'en'): Promise<SearchResult[]> {
  const response = await fetch('/api/search', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, language })
  });
  if (!response.ok) throw new Error('Search failed');
  return response.json();
}

export async function processStory(payload: { name: string; age: number; transcript: string; language: 'en' | 'ar' }) {
  const response = await fetch('/api/process-story', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error('Story processing failed');
  return response.json();
}

export async function askStory(story: Story, question: string, contributor: Contributor, language: 'en' | 'ar') {
  const response = await fetch('/api/ask-story', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ story, contributor, question, language })
  });
  if (!response.ok) throw new Error('Question failed');
  return response.json() as Promise<{ answer: string }>;
}
