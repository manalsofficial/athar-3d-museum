export type Language = 'en' | 'ar';

export type Contributor = {
  id: string;
  name: string;
  age: number;
  region: string;
  skill: string;
  years: number;
  bio: string;
  storyIds: string[];
  image: string;
};

export type Story = {
  id: string;
  title: string;
  contributorId: string;
  category: string;
  region: string;
  transcript: string;
  audioUrl?: string;
  duration?: string;
  tags?: string[];
  summary?: string;
};

export type Exhibit = {
  id: string;

  title: string;

  category: string;

  description: string;

  storyId: string;

  position: "left" | "back" | "right";

  image: string;
};

export type SearchResult = Contributor & { matchReason?: string };
