export declare class SpeechSynthesisTTS {
    private locale?;
    constructor(locale?: string);
    get voiceOptions(): import("rc-select/lib/Select").DefaultOptionType[] | undefined;
    static localeOptions: import("rc-select/lib/Select").DefaultOptionType[] | undefined;
    static voiceList: {
        readonly 'ar-SA': readonly ["Majed"];
        readonly 'de-DE': readonly ["Anna", "Eddy (德语（德国）)", "Flo (德语（德国）)", "Grandma (德语（德国）)", "Grandpa (德语（德国）)", "Helena", "Martin", "Reed (德语（德国）)", "Rocko (德语（德国）)", "Sandy (德语（德国）)", "Shelley (德语（德国）)", "Google Deutsch"];
        readonly 'en-US': readonly ["Aaron", "Albert", "Bad News", "Bahh", "Bells", "Boing", "Bubbles", "Cellos", "Eddy (英语（美国）)", "Flo (英语（美国）)", "Fred", "Good News", "Grandma (英语（美国）)", "Grandpa (英语（美国）)", "Jester", "Junior", "Kathy", "Nicky", "Organ", "Ralph", "Reed (英语（美国）)", "Rocko (英语（美国）)", "Samantha", "Sandy (英语（美国）)", "Shelley (英语（美国）)", "Superstar", "Trinoids", "Whisper", "Wobble", "Zarvox", "Google US English"];
        readonly 'es-ES': readonly ["Eddy (西班牙语（西班牙）)", "Flo (西班牙语（西班牙）)", "Grandma (西班牙语（西班牙）)", "Grandpa (西班牙语（西班牙）)", "Mónica", "Reed (西班牙语（西班牙）)", "Rocko (西班牙语（西班牙）)", "Sandy (西班牙语（西班牙）)", "Shelley (西班牙语（西班牙）)", "Google español"];
        readonly 'fr-FR': readonly ["Daniel (法语（法国）)", "Eddy (法语（法国）)", "Flo (法语（法国）)", "Grandma (法语（法国）)", "Grandpa (法语（法国）)", "Jacques", "Marie", "Rocko (法语（法国）)", "Sandy (法语（法国）)", "Shelley (法语（法国）)", "Thomas", "Google français"];
        readonly 'ja-JP': readonly ["Hattori", "Kyoko", "O-Ren", "Google 日本語"];
        readonly 'ko-KR': readonly ["Yuna", "Google 한국의"];
        readonly 'pt-BR': readonly ["Eddy (葡萄牙语（巴西）)", "Flo (葡萄牙语（巴西）)", "Grandma (葡萄牙语（巴西）)", "Grandpa (葡萄牙语（巴西）)", "Luciana", "Reed (葡萄牙语（巴西）)", "Rocko (葡萄牙语（巴西）)", "Sandy (葡萄牙语（巴西）)", "Shelley (葡萄牙语（巴西）)", "Google português do Brasil"];
        readonly 'ru-RU': readonly ["Milena", "Google русский"];
        readonly 'zh-CN': readonly ["婷婷", "Li-Mu", "语舒", "Google 普通话（中国大陆）"];
        readonly 'zh-TW': readonly ["美嘉", "Google 國語（臺灣）", "善怡", "Google 粤語（香港）"];
    };
}
