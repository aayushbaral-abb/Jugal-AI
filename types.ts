export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export enum Language {
  ENGLISH = 'en-US',
  NEPALI = 'ne-NP'
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  apiKey: string | null;
}
