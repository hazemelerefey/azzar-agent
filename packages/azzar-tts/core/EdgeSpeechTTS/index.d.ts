import { type EdgeSpeechPayload } from './createEdgeSpeech';
export type { EdgeSpeechPayload } from './createEdgeSpeech';
export interface EdgeSpeechAPI {
    headers?: Headers;
    locale?: string;
    serviceUrl?: string;
}
export declare class EdgeSpeechTTS {
    private locale?;
    private serviceUrl?;
    private headers?;
    constructor({ serviceUrl, locale, headers }?: EdgeSpeechAPI);
    get voiceOptions(): import("rc-select/lib/Select").DefaultOptionType[] | undefined;
    static localeOptions: import("rc-select/lib/Select").DefaultOptionType[] | undefined;
    static voiceList: {
        readonly 'ar-SA': readonly ["ar-SA-HamedNeural", "ar-SA-ZariyahNeural"];
        readonly 'de-DE': readonly ["de-DE-AmalaNeural", "de-DE-ConradNeural", "de-DE-KatjaNeural", "de-DE-KillianNeural"];
        readonly 'en-US': readonly ["en-US-AriaNeural", "en-US-AnaNeural", "en-US-ChristopherNeural", "en-US-EricNeural", "en-US-GuyNeural", "en-US-JennyNeural", "en-US-MichelleNeural", "en-US-RogerNeural", "en-US-SteffanNeural"];
        readonly 'es-ES': readonly ["es-ES-AlvaroNeural", "es-ES-ElviraNeural"];
        readonly 'fr-FR': readonly ["fr-FR-DeniseNeural", "fr-FR-EloiseNeural", "fr-FR-HenriNeural"];
        readonly 'ja-JP': readonly ["ja-JP-KeitaNeural", "ja-JP-NanamiNeural"];
        readonly 'ko-KR': readonly ["ko-KR-InJoonNeural", "ko-KR-SunHiNeural"];
        readonly 'pt-BR': readonly ["pt-BR-AntonioNeural", "pt-BR-FranciscaNeural"];
        readonly 'ru-RU': readonly ["ru-RU-DmitryNeural", "ru-RU-SvetlanaNeural"];
        readonly 'zh-CN': readonly ["zh-CN-XiaoxiaoNeural", "zh-CN-XiaoyiNeural", "zh-CN-YunjianNeural", "zh-CN-liaoning-XiaobeiNeural", "zh-CN-shaanxi-XiaoniNeural", "zh-CN-YunxiNeural", "zh-CN-YunxiaNeural", "zh-CN-YunyangNeural"];
        readonly 'zh-TW': readonly ["zh-TW-HsiaoChenNeural", "zh-TW-YunJheNeural", "zh-TW-HsiaoYuNeural"];
    };
    static voiceName: any;
    static createRequest: ({ payload }: import("./createEdgeSpeech").CreateEdgeSpeechCompletionOptions, { proxyUrl, token }?: {
        proxyUrl?: string | undefined;
        token?: string | undefined;
    }) => Promise<Response>;
    private fetch;
    create: (payload: EdgeSpeechPayload) => Promise<Response>;
    /**
     * Browser only
     * @param payload
     */
    createAudio: (payload: EdgeSpeechPayload) => Promise<AudioBuffer>;
}
