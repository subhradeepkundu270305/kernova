export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  contextFiles?: string[]
}

export interface ModelInfo {
  name: string
  size?: number
  parameterSize?: string
  quantization?: string
  modifiedAt?: string
  license?: string
  description?: string
}

export interface PullProgress {
  status: string
  digest?: string
  total?: number
  completed?: number
  percent?: number
}

export interface AIProvider {
  id: string
  name: string
  type: 'local' | 'cloud'
  isAvailable(): Promise<boolean>
  listModels(): Promise<ModelInfo[]>
  chat(
    messages: { role: string; content: string }[],
    options?: {
      model?: string
      temperature?: number
      signal?: AbortSignal
      onChunk?: (chunk: string) => void
    }
  ): Promise<string>
  complete(
    prompt: string,
    options?: {
      model?: string
      suffix?: string
      signal?: AbortSignal
    }
  ): Promise<string>
}

export interface ModelRamRecommendation {
  minRamGB: number
  maxRamGB: number
  chatModel: string
  autocompleteModel: string
  description: string
  license: string
}

export const RAM_MODEL_RECOMMENDATIONS: ModelRamRecommendation[] = [
  {
    minRamGB: 0,
    maxRamGB: 4,
    chatModel: 'qwen2.5-coder:0.5b',
    autocompleteModel: 'none',
    description: 'Ultra-lightweight model for 4 GB RAM machines or suggest cloud AI.',
    license: 'Apache 2.0',
  },
  {
    minRamGB: 5,
    maxRamGB: 6,
    chatModel: 'qwen2.5-coder:1.5b',
    autocompleteModel: 'qwen2.5-coder:1.5b',
    description: 'Lightweight model with balanced speed on 6 GB RAM.',
    license: 'Apache 2.0',
  },
  {
    minRamGB: 7,
    maxRamGB: 10,
    chatModel: 'qwen2.5-coder:3b',
    autocompleteModel: 'qwen2.5-coder:1.5b',
    description:
      'Optimal choice for your 8 GB machine: high quality code chat & speedy completion.',
    license: 'Qwen Research / Apache 2.0',
  },
  {
    minRamGB: 11,
    maxRamGB: 20,
    chatModel: 'qwen2.5-coder:7b',
    autocompleteModel: 'qwen2.5-coder:1.5b',
    description: 'State-of-the-art coding assistance for 12-16 GB RAM.',
    license: 'Apache 2.0',
  },
  {
    minRamGB: 21,
    maxRamGB: 128,
    chatModel: 'qwen2.5-coder:14b',
    autocompleteModel: 'qwen2.5-coder:1.5b',
    description: 'Heavyweight reasoning and full-project coding power for 24+ GB RAM.',
    license: 'Apache 2.0',
  },
]
