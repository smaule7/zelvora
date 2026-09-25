export type FileType =
  | 'pdf'
  | 'doc'
  | 'docx'
  | 'txt'
  | 'csv'
  | 'xls'
  | 'xlsx'
  | 'image'
  | 'audio'
  | 'other';

export interface Attachment {
  id: string;
  name: string;
  size: number;
  sizeFormatted: string;
  type: FileType;
  extension: string;
  file?: File;
  url?: string;
  previewUrl?: string;
  duration?: string;
  dataSnippet?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachments?: Attachment[];
  isGenerating?: boolean;
  error?: string;
  modelInfo?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  requestId?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
  messages: Message[];
  tags?: string[];
}

export interface UserSettings {
  profileName: string;
  email: string;
  avatar: string;
  role: string;
  customInstructions: {
    aboutUser: string;
    responseStyle: string;
  };
  appearance: {
    themeMode: 'pure-black' | 'dark-charcoal';
    codeFont: 'JetBrains Mono' | 'Fira Code' | 'monospace';
    compactSpacing: boolean;
  };
  chatSettings: {
    streamResponses: boolean;
    temperature: number;
    contextLength: string;
    autoScroll: boolean;
    soundAlerts: boolean;
  };
  integrations: {
    supabaseAuth: {
      status: 'ready' | 'connected' | 'unconfigured';
      url: string;
    };
    supabaseDatabase: {
      status: 'ready' | 'connected' | 'unconfigured';
      tables: string[];
    };
    supabaseStorage: {
      status: 'ready' | 'connected' | 'unconfigured';
      bucket: string;
    };
    zapierWebhook: {
      status: 'ready' | 'connected' | 'unconfigured';
      endpoint?: string;
    };
    zelvoroAgent: {
      status: 'ready' | 'connected' | 'unconfigured';
      model: string;
      version: string;
    };
  };
}
