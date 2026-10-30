import type { Bi } from '../catalog';

const OLLAMA_HOST = 'http://localhost:11434';

export interface OllamaCheckResult {
  available: boolean;
  models: string[];
}

let cachedStatus: { result: OllamaCheckResult; timestamp: number } | null = null;

export const checkOllamaStatus = async (force = false): Promise<OllamaCheckResult> => {
  const now = Date.now();
  if (!force && cachedStatus && now - cachedStatus.timestamp < 10_000) {
    return cachedStatus.result;
  }

  try {
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) {
      cachedStatus = { result: { available: false, models: [] }, timestamp: now };
      return cachedStatus.result;
    }
    const data = await res.json();
    const models: string[] = (data.models || []).map((m: any) => m.name || m.model);
    cachedStatus = {
      result: {
        available: true,
        models,
      },
      timestamp: now,
    };
    return cachedStatus.result;
  } catch {
    cachedStatus = { result: { available: false, models: [] }, timestamp: now };
    return cachedStatus.result;
  }
};

export interface GenerateStepInput {
  actor: string;
  defaultOutput: Bi;
  goal: string;
  lang?: 'ar' | 'en';
  model?: string;
  stepKind: string;
  stepTitle: Bi;
}

export const generateOllamaMissionStep = async (input: GenerateStepInput): Promise<Bi> => {
  const model = input.model || 'qwen2.5:7b';
  const prompt = `You are the ${input.actor} in the AZZAR agent system executing a mission step.
Mission Goal: "${input.goal}"
Step Title: "${input.stepTitle.en}" / "${input.stepTitle.ar}"
Step Kind: ${input.stepKind}

Generate the real executive work output for this step.
Provide a clear, detailed, professional response formatted with:
[EN]
(English work output)
[AR]
(Arabic work output)
`;

  try {
    const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
      body: JSON.stringify({
        model,
        options: {
          temperature: 0.6,
        },
        prompt,
        stream: false,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      signal: AbortSignal.timeout(25_000),
    });

    if (!res.ok) return input.defaultOutput;
    const data = await res.json();
    const text: string = data.response || '';
    if (!text.trim()) return input.defaultOutput;

    // Parse [EN] and [AR] sections
    let en = '';
    let ar = '';

    const enIndex = text.indexOf('[EN]');
    const arIndex = text.indexOf('[AR]');

    if (enIndex !== -1 && arIndex !== -1) {
      if (enIndex < arIndex) {
        en = text.slice(enIndex + 4, arIndex).trim();
        ar = text.slice(arIndex + 4).trim();
      } else {
        ar = text.slice(arIndex + 4, enIndex).trim();
        en = text.slice(enIndex + 4).trim();
      }
    } else if (arIndex !== -1) {
      ar = text.slice(arIndex + 4).trim();
      en = ar;
    } else if (enIndex !== -1) {
      en = text.slice(enIndex + 4).trim();
      ar = en;
    } else {
      en = text.trim();
      ar = text.trim();
    }

    return {
      ar: ar || input.defaultOutput.ar,
      en: en || input.defaultOutput.en,
    };
  } catch {
    return input.defaultOutput;
  }
};
