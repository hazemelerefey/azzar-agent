export declare class VoiceList {
    private locale?;
    constructor(locale?: string);
    get speechSynthesVoiceOptions(): import("rc-select/lib/Select").DefaultOptionType[] | undefined;
    get azureVoiceOptions(): import("rc-select/lib/Select").DefaultOptionType[] | undefined;
    get edgeVoiceOptions(): import("rc-select/lib/Select").DefaultOptionType[] | undefined;
    get microsoftVoiceOptions(): import("rc-select/lib/Select").DefaultOptionType[] | undefined;
    static openaiVoiceOptions: import("rc-select/lib/Select").DefaultOptionType[] | undefined;
    static localeOptions: import("rc-select/lib/Select").DefaultOptionType[] | undefined;
}
