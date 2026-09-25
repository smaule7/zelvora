import { Conversation, UserSettings, Attachment, FileType } from '../types';

export const INITIAL_USER_SETTINGS: UserSettings = {
  profileName: 'Samuel Oboh',
  email: 'samueloboh767@gmail.com',
  avatar: 'SO',
  role: 'Member',
  customInstructions: {
    aboutUser: 'Product builder focused on clean workflows and helpful, thoughtful solutions.',
    responseStyle: 'Direct, clear, and well-structured with helpful examples.',
  },
  appearance: {
    themeMode: 'pure-black',
    codeFont: 'JetBrains Mono',
    compactSpacing: false,
  },
  chatSettings: {
    streamResponses: true,
    temperature: 0.7,
    contextLength: '32k tokens',
    autoScroll: true,
    soundAlerts: false,
  },
  integrations: {
    supabaseAuth: {
      status: 'ready',
      url: 'https://zelvoro-auth.supabase.co',
    },
    supabaseDatabase: {
      status: 'ready',
      tables: ['conversations', 'messages', 'attachments'],
    },
    supabaseStorage: {
      status: 'ready',
      bucket: 'zelvoro-multimodal-vault',
    },
    zapierWebhook: {
      status: 'ready',
    },
    zelvoroAgent: {
      status: 'ready',
      model: 'Zelvoro Assistant',
      version: 'production',
    },
  },
};

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Q3 Financial Performance & Risk Metrics',
    createdAt: '2026-09-21T08:15:00Z',
    updatedAt: '2026-09-21T08:42:00Z',
    pinned: true,
    tags: ['finance', 'csv', 'analysis'],
    messages: [
      {
        id: 'msg-1-1',
        role: 'user',
        timestamp: '08:15 AM',
        content: 'I have attached our Q3 financial performance sheet. Please audit the regional distribution, verify margin variance across product lines, and outline the mathematical formula used for calculating the risk-weighted Sharpe ratio.',
        attachments: [
          {
            id: 'att-csv-1',
            name: 'q3_performance_ledger.csv',
            size: 428000,
            sizeFormatted: '418 KB',
            type: 'csv',
            extension: 'csv',
            dataSnippet: 'Region,Product,Q2_Revenue,Q3_Revenue,Delta_Percent,Margin_Rate\nNorth America,Enterprise Cloud,1420000,1890000,+33.1%,48.2%\nEurope,Enterprise Cloud,980000,1210000,+23.4%,44.1%\nAsia-Pacific,API Infrastructure,620000,940000,+51.6%,52.8%\nLatin America,Security Suite,310000,345000,+11.2%,39.5%',
          },
        ],
      },
      {
        id: 'msg-1-2',
        role: 'assistant',
        timestamp: '08:16 AM',
        content: `I have parsed and cross-verified **q3_performance_ledger.csv** across all 4 operational regions. Here is the synthesized breakdown:

### 1. Regional Performance & Margin Variance

| Operating Region | Product Line | Q2 Revenue (USD) | Q3 Revenue (USD) | Growth Rate (Δ) | Gross Margin |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **North America** | Enterprise Cloud | $1,420,000 | $1,890,000 | **+33.1%** | 48.2% |
| **Europe** | Enterprise Cloud | $980,000 | $1,210,000 | **+23.4%** | 44.1% |
| **Asia-Pacific** | API Infrastructure | $620,000 | $940,000 | **+51.6%** | **52.8%** |
| **Latin America** | Security Suite | $310,000 | $345,000 | **+11.2%** | 39.5% |

### 2. Key Statistical Insights
* **Highest Velocity**: **Asia-Pacific API Infrastructure** accelerated at **+51.6%**, carrying the highest gross margin rate (**52.8%**).
* **Revenue Anchor**: North America represents **43.1%** of total gross quarterly inflow ($1.89M of $4.385M aggregate).
* **Margin Compression**: Latin America shows lower operational leverage with gross margin dipping below the 40% threshold.

### 3. Risk-Weighted Return Formulation

To assess risk-adjusted efficiency across these business units, we utilize the generalized Sharpe ratio:

$$\\text{Sharpe Ratio} = \\frac{\\mathbb{E}[R_p - R_f]}{\\sigma_p} = \\frac{\\mu_p - R_f}{\\sqrt{\\frac{1}{N-1}\\sum_{t=1}^{N}(R_{p,t} - \\bar{R}_p)^2}}$$

Where:
* $R_p$ denotes the aggregate portfolio return vector
* $R_f$ is the benchmark risk-free hurdle rate (fixed at 4.25% annualized)
* $\\sigma_p$ represents sample variance volatility across quarterly reporting periods

\`\`\`python
# Zelvoro Analytical Module: Metric Synthesis
import numpy as np

def calculate_portfolio_sharpe(revenues: list[float], risk_free_rate: float = 0.0425) -> float:
    quarterly_returns = np.diff(revenues) / revenues[:-1]
    excess_returns = np.mean(quarterly_returns) - (risk_free_rate / 4)
    volatility = np.std(quarterly_returns, ddof=1)
    return float(excess_returns / volatility) if volatility > 0 else 0.0
\`\`\`

Would you like me to model forecasted cash flows under a stress-test scenario for Q4?`,
      },
    ],
  },
  {
    id: 'conv-2',
    title: 'Enterprise Supabase Architecture & RLS',
    createdAt: '2026-09-20T14:10:00Z',
    updatedAt: '2026-09-20T16:30:00Z',
    pinned: false,
    tags: ['supabase', 'database', 'typescript'],
    messages: [
      {
        id: 'msg-2-1',
        role: 'user',
        timestamp: '02:10 PM',
        content: 'Can you structure the Supabase database schema and Row-Level Security (RLS) policies for Zelvoro AI? We need multi-tenant isolation, encrypted message history, and attachment metadata tracking.',
      },
      {
        id: 'msg-2-2',
        role: 'assistant',
        timestamp: '02:11 PM',
        content: `Here is the production-grade PostgreSQL DDL for Supabase with **strict Row Level Security (RLS)**. Every user is authenticated via \`auth.uid()\` and cannot read or mutate foreign workspace records.

### PostgreSQL Database Schema & RLS

\`\`\`sql
-- Enable cryptographic UUID extension
create extension if not exists "uuid-ossp";

-- 1. Conversations Table
create table public.conversations (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null default 'New Conversation',
    is_pinned boolean default false,
    created_at timestamptz default timezone('utc'::text, now()) not null,
    updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.conversations enable row level security;

-- Policy: Only owner can view conversations
create policy "Users can read own conversations"
    on public.conversations for select
    using (auth.uid() = user_id);

-- Policy: Only owner can insert conversations
create policy "Users can create own conversations"
    on public.conversations for insert
    with check (auth.uid() = user_id);

-- 2. Messages Table
create table public.messages (
    id uuid primary key default uuid_generate_v4(),
    conversation_id uuid not null references public.conversations(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null check (role in ('user', 'assistant', 'system')),
    content text not null,
    created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.messages enable row level security;

create policy "Users can read messages in their conversations"
    on public.messages for select
    using (auth.uid() = user_id);
\`\`\`

### Key Architectural Safeguards
1. **Cascade Deletion**: Purging a parent conversation automatically flushes associated messages and attachment pointers.
2. **Storage Separation**: Large binary assets (PDFs, Audio, XLSX) sit in Supabase Storage with signed token access policies.
3. **Database Indexes**: Added composite indexes on \`(user_id, updated_at desc)\` for instant sidebar rendering.`,
      },
    ],
  },
  {
    id: 'conv-3',
    title: 'Voice Strategy Memo - Acoustic Audit',
    createdAt: '2026-09-19T11:05:00Z',
    updatedAt: '2026-09-19T11:22:00Z',
    pinned: false,
    tags: ['audio', 'transcription', 'strategy'],
    messages: [
      {
        id: 'msg-3-1',
        role: 'user',
        timestamp: '11:05 AM',
        content: 'Please process this 4-minute voice note from the executive sync. Transcribe key directives and distill action items.',
        attachments: [
          {
            id: 'att-aud-1',
            name: 'executive_board_memo_sync.mp3',
            size: 3840000,
            sizeFormatted: '3.66 MB',
            type: 'audio',
            extension: 'mp3',
            duration: '04:12',
          },
        ],
      },
      {
        id: 'msg-3-2',
        role: 'assistant',
        timestamp: '11:06 AM',
        content: `I have processed the audio memo **executive_board_memo_sync.mp3** (Duration: 04:12).

### Key Directives Extracted

* **00:45 - 01:30 | Core Infrastructure**: Finalize zero-trust API boundaries before the Q4 enterprise rollout.
* **01:35 - 02:40 | Supabase Database Migration**: Transition all message history to dedicated partitions to minimize cold query latency under 15ms.
* **02:45 - 03:55 | SLA & Latency Target**: Maintain p95 response time within 600ms across streaming tokens.

### Action Items & Assigned Ownership

1. **Database Partitioning**: Implement monthly date-range partition tables on \`messages\` (Target: Friday).
2. **Token Buffer Auditing**: Verify streaming backpressure handlers on client sockets.
3. **Storage Quota**: Provision bucket lifecycle policies for raw audio voice memos older than 90 days.`,
      },
    ],
  },
];

export function classifyFileType(fileName: string): { type: FileType; extension: string } {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'pdf':
      return { type: 'pdf', extension: ext };
    case 'doc':
      return { type: 'doc', extension: ext };
    case 'docx':
      return { type: 'docx', extension: ext };
    case 'txt':
      return { type: 'txt', extension: ext };
    case 'csv':
      return { type: 'csv', extension: ext };
    case 'xls':
      return { type: 'xls', extension: ext };
    case 'xlsx':
      return { type: 'xlsx', extension: ext };
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'webp':
    case 'gif':
    case 'svg':
      return { type: 'image', extension: ext };
    case 'mp3':
    case 'wav':
    case 'm4a':
    case 'ogg':
    case 'aac':
      return { type: 'audio', extension: ext };
    default:
      return { type: 'other', extension: ext };
  }
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
