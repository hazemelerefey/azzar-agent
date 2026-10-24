export type TTSServer = 'openai';

export interface AzzarAgentTTSConfig {
  showAllLocaleVoice?: boolean;
  ttsService: TTSServer;
  voice: {
    openai: string;
  };
}
