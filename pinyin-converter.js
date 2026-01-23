/**
 * Pinyin Converter Module
 * Converts pinyin to zhuyin (bopomofo) and IPA
 * Based on standard Mandarin phonology (Lee & Zee 2003)
 */

const PinyinConverter = (function() {

    // Pinyin to Zhuyin (Bopomofo) mapping
    // Based on standard Bopomofo syllable table
    const PINYIN_TO_ZHUYIN = {
        // Special syllables
        'a': 'ㄚ', 'o': 'ㄛ', 'e': 'ㄜ', 'er': 'ㄦ',
        'ai': 'ㄞ', 'ei': 'ㄟ', 'ao': 'ㄠ', 'ou': 'ㄡ',
        'an': 'ㄢ', 'en': 'ㄣ', 'ang': 'ㄤ', 'eng': 'ㄥ',

        // b- series
        'ba': 'ㄅㄚ', 'bo': 'ㄅㄛ', 'bai': 'ㄅㄞ', 'bei': 'ㄅㄟ',
        'bao': 'ㄅㄠ', 'ban': 'ㄅㄢ', 'ben': 'ㄅㄣ', 'bang': 'ㄅㄤ',
        'beng': 'ㄅㄥ', 'bi': 'ㄅㄧ', 'bie': 'ㄅㄧㄝ', 'biao': 'ㄅㄧㄠ',
        'bian': 'ㄅㄧㄢ', 'bin': 'ㄅㄧㄣ', 'bing': 'ㄅㄧㄥ', 'bu': 'ㄅㄨ',

        // p- series
        'pa': 'ㄆㄚ', 'po': 'ㄆㄛ', 'pai': 'ㄆㄞ', 'pei': 'ㄆㄟ',
        'pao': 'ㄆㄠ', 'pou': 'ㄆㄡ', 'pan': 'ㄆㄢ', 'pen': 'ㄆㄣ',
        'pang': 'ㄆㄤ', 'peng': 'ㄆㄥ', 'pi': 'ㄆㄧ', 'pie': 'ㄆㄧㄝ',
        'piao': 'ㄆㄧㄠ', 'pian': 'ㄆㄧㄢ', 'pin': 'ㄆㄧㄣ', 'ping': 'ㄆㄧㄥ',
        'pu': 'ㄆㄨ',

        // m- series
        'ma': 'ㄇㄚ', 'mo': 'ㄇㄛ', 'me': 'ㄇㄜ', 'mai': 'ㄇㄞ',
        'mei': 'ㄇㄟ', 'mao': 'ㄇㄠ', 'mou': 'ㄇㄡ', 'man': 'ㄇㄢ',
        'men': 'ㄇㄣ', 'mang': 'ㄇㄤ', 'meng': 'ㄇㄥ', 'mi': 'ㄇㄧ',
        'mie': 'ㄇㄧㄝ', 'miao': 'ㄇㄧㄠ', 'miu': 'ㄇㄧㄡ', 'mian': 'ㄇㄧㄢ',
        'min': 'ㄇㄧㄣ', 'ming': 'ㄇㄧㄥ', 'mu': 'ㄇㄨ',

        // f- series
        'fa': 'ㄈㄚ', 'fo': 'ㄈㄛ', 'fei': 'ㄈㄟ', 'fou': 'ㄈㄡ',
        'fan': 'ㄈㄢ', 'fen': 'ㄈㄣ', 'fang': 'ㄈㄤ', 'feng': 'ㄈㄥ',
        'fu': 'ㄈㄨ',

        // d- series
        'da': 'ㄉㄚ', 'de': 'ㄉㄜ', 'dai': 'ㄉㄞ', 'dei': 'ㄉㄟ',
        'dao': 'ㄉㄠ', 'dou': 'ㄉㄡ', 'dan': 'ㄉㄢ', 'den': 'ㄉㄣ',
        'dang': 'ㄉㄤ', 'deng': 'ㄉㄥ', 'di': 'ㄉㄧ', 'die': 'ㄉㄧㄝ',
        'diao': 'ㄉㄧㄠ', 'diu': 'ㄉㄧㄡ', 'dian': 'ㄉㄧㄢ', 'ding': 'ㄉㄧㄥ',
        'du': 'ㄉㄨ', 'duo': 'ㄉㄨㄛ', 'dui': 'ㄉㄨㄟ', 'duan': 'ㄉㄨㄢ',
        'dun': 'ㄉㄨㄣ', 'dong': 'ㄉㄨㄥ',

        // t- series
        'ta': 'ㄊㄚ', 'te': 'ㄊㄜ', 'tai': 'ㄊㄞ', 'tao': 'ㄊㄠ',
        'tou': 'ㄊㄡ', 'tan': 'ㄊㄢ', 'tang': 'ㄊㄤ', 'teng': 'ㄊㄥ',
        'ti': 'ㄊㄧ', 'tie': 'ㄊㄧㄝ', 'tiao': 'ㄊㄧㄠ', 'tian': 'ㄊㄧㄢ',
        'ting': 'ㄊㄧㄥ', 'tu': 'ㄊㄨ', 'tuo': 'ㄊㄨㄛ', 'tui': 'ㄊㄨㄟ',
        'tuan': 'ㄊㄨㄢ', 'tun': 'ㄊㄨㄣ', 'tong': 'ㄊㄨㄥ',

        // n- series
        'na': 'ㄋㄚ', 'ne': 'ㄋㄜ', 'nai': 'ㄋㄞ', 'nei': 'ㄋㄟ',
        'nao': 'ㄋㄠ', 'nou': 'ㄋㄡ', 'nan': 'ㄋㄢ', 'nen': 'ㄋㄣ',
        'nang': 'ㄋㄤ', 'neng': 'ㄋㄥ', 'ni': 'ㄋㄧ', 'nie': 'ㄋㄧㄝ',
        'niao': 'ㄋㄧㄠ', 'niu': 'ㄋㄧㄡ', 'nian': 'ㄋㄧㄢ', 'nin': 'ㄋㄧㄣ',
        'niang': 'ㄋㄧㄤ', 'ning': 'ㄋㄧㄥ', 'nu': 'ㄋㄨ', 'nuo': 'ㄋㄨㄛ',
        'nuan': 'ㄋㄨㄢ', 'nong': 'ㄋㄨㄥ', 'nü': 'ㄋㄩ', 'nue': 'ㄋㄩㄝ',
        'nv': 'ㄋㄩ',

        // l- series
        'la': 'ㄌㄚ', 'le': 'ㄌㄜ', 'lai': 'ㄌㄞ', 'lei': 'ㄌㄟ',
        'lao': 'ㄌㄠ', 'lou': 'ㄌㄡ', 'lan': 'ㄌㄢ', 'lang': 'ㄌㄤ',
        'leng': 'ㄌㄥ', 'li': 'ㄌㄧ', 'lia': 'ㄌㄧㄚ', 'lie': 'ㄌㄧㄝ',
        'liao': 'ㄌㄧㄠ', 'liu': 'ㄌㄧㄡ', 'lian': 'ㄌㄧㄢ', 'lin': 'ㄌㄧㄣ',
        'liang': 'ㄌㄧㄤ', 'ling': 'ㄌㄧㄥ', 'lu': 'ㄌㄨ', 'luo': 'ㄌㄨㄛ',
        'luan': 'ㄌㄨㄢ', 'lun': 'ㄌㄨㄣ', 'long': 'ㄌㄨㄥ', 'lü': 'ㄌㄩ',
        'lue': 'ㄌㄩㄝ', 'lv': 'ㄌㄩ',

        // g- series
        'ga': 'ㄍㄚ', 'ge': 'ㄍㄜ', 'gai': 'ㄍㄞ', 'gei': 'ㄍㄟ',
        'gao': 'ㄍㄠ', 'gou': 'ㄍㄡ', 'gan': 'ㄍㄢ', 'gen': 'ㄍㄣ',
        'gang': 'ㄍㄤ', 'geng': 'ㄍㄥ', 'gu': 'ㄍㄨ', 'gua': 'ㄍㄨㄚ',
        'guo': 'ㄍㄨㄛ', 'guai': 'ㄍㄨㄞ', 'gui': 'ㄍㄨㄟ', 'guan': 'ㄍㄨㄢ',
        'gun': 'ㄍㄨㄣ', 'guang': 'ㄍㄨㄤ', 'gong': 'ㄍㄨㄥ',

        // k- series
        'ka': 'ㄎㄚ', 'ke': 'ㄎㄜ', 'kai': 'ㄎㄞ', 'kei': 'ㄎㄟ',
        'kao': 'ㄎㄠ', 'kou': 'ㄎㄡ', 'kan': 'ㄎㄢ', 'ken': 'ㄎㄣ',
        'kang': 'ㄎㄤ', 'keng': 'ㄎㄥ', 'ku': 'ㄎㄨ', 'kua': 'ㄎㄨㄚ',
        'kuo': 'ㄎㄨㄛ', 'kuai': 'ㄎㄨㄞ', 'kui': 'ㄎㄨㄟ', 'kuan': 'ㄎㄨㄢ',
        'kun': 'ㄎㄨㄣ', 'kuang': 'ㄎㄨㄤ', 'kong': 'ㄎㄨㄥ',

        // h- series
        'ha': 'ㄏㄚ', 'he': 'ㄏㄜ', 'hai': 'ㄏㄞ', 'hei': 'ㄏㄟ',
        'hao': 'ㄏㄠ', 'hou': 'ㄏㄡ', 'han': 'ㄏㄢ', 'hen': 'ㄏㄣ',
        'hang': 'ㄏㄤ', 'heng': 'ㄏㄥ', 'hu': 'ㄏㄨ', 'hua': 'ㄏㄨㄚ',
        'huo': 'ㄏㄨㄛ', 'huai': 'ㄏㄨㄞ', 'hui': 'ㄏㄨㄟ', 'huan': 'ㄏㄨㄢ',
        'hun': 'ㄏㄨㄣ', 'huang': 'ㄏㄨㄤ', 'hong': 'ㄏㄨㄥ',

        // j- series
        'ji': 'ㄐㄧ', 'jia': 'ㄐㄧㄚ', 'jie': 'ㄐㄧㄝ', 'jiao': 'ㄐㄧㄠ',
        'jiu': 'ㄐㄧㄡ', 'jian': 'ㄐㄧㄢ', 'jin': 'ㄐㄧㄣ', 'jiang': 'ㄐㄧㄤ',
        'jing': 'ㄐㄧㄥ', 'ju': 'ㄐㄩ', 'jue': 'ㄐㄩㄝ', 'juan': 'ㄐㄩㄢ',
        'jun': 'ㄐㄩㄣ', 'jiong': 'ㄐㄩㄥ',

        // q- series
        'qi': 'ㄑㄧ', 'qia': 'ㄑㄧㄚ', 'qie': 'ㄑㄧㄝ', 'qiao': 'ㄑㄧㄠ',
        'qiu': 'ㄑㄧㄡ', 'qian': 'ㄑㄧㄢ', 'qin': 'ㄑㄧㄣ', 'qiang': 'ㄑㄧㄤ',
        'qing': 'ㄑㄧㄥ', 'qu': 'ㄑㄩ', 'que': 'ㄑㄩㄝ', 'quan': 'ㄑㄩㄢ',
        'qun': 'ㄑㄩㄣ', 'qiong': 'ㄑㄩㄥ',

        // x- series
        'xi': 'ㄒㄧ', 'xia': 'ㄒㄧㄚ', 'xie': 'ㄒㄧㄝ', 'xiao': 'ㄒㄧㄠ',
        'xiu': 'ㄒㄧㄡ', 'xian': 'ㄒㄧㄢ', 'xin': 'ㄒㄧㄣ', 'xiang': 'ㄒㄧㄤ',
        'xing': 'ㄒㄧㄥ', 'xu': 'ㄒㄩ', 'xue': 'ㄒㄩㄝ', 'xuan': 'ㄒㄩㄢ',
        'xun': 'ㄒㄩㄣ', 'xiong': 'ㄒㄩㄥ',

        // zh- series
        'zha': 'ㄓㄚ', 'zhe': 'ㄓㄜ', 'zhi': 'ㄓ', 'zhai': 'ㄓㄞ',
        'zhei': 'ㄓㄟ', 'zhao': 'ㄓㄠ', 'zhou': 'ㄓㄡ', 'zhan': 'ㄓㄢ',
        'zhen': 'ㄓㄣ', 'zhang': 'ㄓㄤ', 'zheng': 'ㄓㄥ', 'zhu': 'ㄓㄨ',
        'zhua': 'ㄓㄨㄚ', 'zhuo': 'ㄓㄨㄛ', 'zhuai': 'ㄓㄨㄞ', 'zhui': 'ㄓㄨㄟ',
        'zhuan': 'ㄓㄨㄢ', 'zhun': 'ㄓㄨㄣ', 'zhuang': 'ㄓㄨㄤ', 'zhong': 'ㄓㄨㄥ',

        // ch- series
        'cha': 'ㄔㄚ', 'che': 'ㄔㄜ', 'chi': 'ㄔ', 'chai': 'ㄔㄞ',
        'chao': 'ㄔㄠ', 'chou': 'ㄔㄡ', 'chan': 'ㄔㄢ', 'chen': 'ㄔㄣ',
        'chang': 'ㄔㄤ', 'cheng': 'ㄔㄥ', 'chu': 'ㄔㄨ', 'chua': 'ㄔㄨㄚ',
        'chuo': 'ㄔㄨㄛ', 'chuai': 'ㄔㄨㄞ', 'chui': 'ㄔㄨㄟ', 'chuan': 'ㄔㄨㄢ',
        'chun': 'ㄔㄨㄣ', 'chuang': 'ㄔㄨㄤ', 'chong': 'ㄔㄨㄥ',

        // sh- series
        'sha': 'ㄕㄚ', 'she': 'ㄕㄜ', 'shi': 'ㄕ', 'shai': 'ㄕㄞ',
        'shei': 'ㄕㄟ', 'shao': 'ㄕㄠ', 'shou': 'ㄕㄡ', 'shan': 'ㄕㄢ',
        'shen': 'ㄕㄣ', 'shang': 'ㄕㄤ', 'sheng': 'ㄕㄥ', 'shu': 'ㄕㄨ',
        'shua': 'ㄕㄨㄚ', 'shuo': 'ㄕㄨㄛ', 'shuai': 'ㄕㄨㄞ', 'shui': 'ㄕㄨㄟ',
        'shuan': 'ㄕㄨㄢ', 'shun': 'ㄕㄨㄣ', 'shuang': 'ㄕㄨㄤ',

        // r- series
        'ra': 'ㄖㄚ', 're': 'ㄖㄜ', 'ri': 'ㄖ', 'rao': 'ㄖㄠ',
        'rou': 'ㄖㄡ', 'ran': 'ㄖㄢ', 'ren': 'ㄖㄣ', 'rang': 'ㄖㄤ',
        'reng': 'ㄖㄥ', 'ru': 'ㄖㄨ', 'ruo': 'ㄖㄨㄛ', 'rui': 'ㄖㄨㄟ',
        'ruan': 'ㄖㄨㄢ', 'run': 'ㄖㄨㄣ', 'rong': 'ㄖㄨㄥ',

        // z- series
        'za': 'ㄗㄚ', 'ze': 'ㄗㄜ', 'zi': 'ㄗ', 'zai': 'ㄗㄞ',
        'zei': 'ㄗㄟ', 'zao': 'ㄗㄠ', 'zou': 'ㄗㄡ', 'zan': 'ㄗㄢ',
        'zen': 'ㄗㄣ', 'zang': 'ㄗㄤ', 'zeng': 'ㄗㄥ', 'zu': 'ㄗㄨ',
        'zuo': 'ㄗㄨㄛ', 'zui': 'ㄗㄨㄟ', 'zuan': 'ㄗㄨㄢ', 'zun': 'ㄗㄨㄣ',
        'zong': 'ㄗㄨㄥ',

        // c- series
        'ca': 'ㄘㄚ', 'ce': 'ㄘㄜ', 'ci': 'ㄘ', 'cai': 'ㄘㄞ',
        'cao': 'ㄘㄠ', 'cou': 'ㄘㄡ', 'can': 'ㄘㄢ', 'cen': 'ㄘㄣ',
        'cang': 'ㄘㄤ', 'ceng': 'ㄘㄥ', 'cu': 'ㄘㄨ', 'cuo': 'ㄘㄨㄛ',
        'cui': 'ㄘㄨㄟ', 'cuan': 'ㄘㄨㄢ', 'cun': 'ㄘㄨㄣ', 'cong': 'ㄘㄨㄥ',

        // s- series
        'sa': 'ㄙㄚ', 'se': 'ㄙㄜ', 'si': 'ㄙ', 'sai': 'ㄙㄞ',
        'sao': 'ㄙㄠ', 'sou': 'ㄙㄡ', 'san': 'ㄙㄢ', 'sen': 'ㄙㄣ',
        'sang': 'ㄙㄤ', 'seng': 'ㄙㄥ', 'su': 'ㄙㄨ', 'suo': 'ㄙㄨㄛ',
        'sui': 'ㄙㄨㄟ', 'suan': 'ㄙㄨㄢ', 'sun': 'ㄙㄨㄣ', 'song': 'ㄙㄨㄥ',

        // y- series
        'ya': 'ㄧㄚ', 'yo': 'ㄧㄛ', 'ye': 'ㄧㄝ', 'yai': 'ㄧㄞ',
        'yao': 'ㄧㄠ', 'you': 'ㄧㄡ', 'yan': 'ㄧㄢ', 'yin': 'ㄧㄣ',
        'yang': 'ㄧㄤ', 'ying': 'ㄧㄥ', 'yi': 'ㄧ', 'yong': 'ㄩㄥ',
        'yu': 'ㄩ', 'yue': 'ㄩㄝ', 'yuan': 'ㄩㄢ', 'yun': 'ㄩㄣ',

        // w- series
        'wa': 'ㄨㄚ', 'wo': 'ㄨㄛ', 'wai': 'ㄨㄞ', 'wei': 'ㄨㄟ',
        'wan': 'ㄨㄢ', 'wen': 'ㄨㄣ', 'wang': 'ㄨㄤ', 'weng': 'ㄨㄥ',
        'wu': 'ㄨ',
    };

    // Tone number to tone mark mapping (for zhuyin)
    const TONE_MARKS = {
        '1': 'ˉ',   // First tone (high level)
        '2': 'ˊ',   // Second tone (rising)
        '3': 'ˇ',   // Third tone (dipping)
        '4': 'ˋ',   // Fourth tone (falling)
        '5': '˙',   // Neutral/light tone
    };

    // Tone number to Chao tone letters (for IPA)
    const CHAO_TONES = {
        '1': '˥˥',   // 55 - high level
        '2': '˧˥',   // 35 - rising
        '3': '˨˩˦',  // 214 - dipping
        '4': '˥˩',   // 51 - falling
        '5': '',     // neutral tone (no mark)
    };

    /**
     * Strip tone numbers from pinyin
     * 'guo3' -> 'guo', '3'
     */
    function splitPinyinTone(syllable) {
        const match = syllable.match(/^([a-zü:]+)([1-5])?$/i);
        if (!match) return { base: syllable, tone: '' };
        return { base: match[1], tone: match[2] || '' };
    }

    /**
     * Convert pinyin syllable to zhuyin
     * 'guo3' -> 'ㄍㄨㄛˇ'
     */
    function pinyinToZhuyin(pinyin) {
        pinyin = pinyin.toLowerCase().replace('ü', 'v').replace('u:', 'v');
        const { base, tone } = splitPinyinTone(pinyin);

        let zhuyin = PINYIN_TO_ZHUYIN[base];
        if (!zhuyin) {
            console.warn(`Unknown pinyin syllable: ${base}`);
            return pinyin; // Return original if not found
        }

        // Add tone mark
        if (tone && TONE_MARKS[tone]) {
            zhuyin += TONE_MARKS[tone];
        }

        return zhuyin;
    }

    /**
     * Convert full pinyin phrase to zhuyin
     * 'guo3 zhi1' -> 'ㄍㄨㄛˇ ㄓˉ'
     */
    function convertToZhuyin(pinyin) {
        const syllables = pinyin.trim().split(/\s+/);
        return syllables.map(s => pinyinToZhuyin(s)).join(' ');
    }

    /**
     * Convert pinyin to IPA (simplified, using tone numbers)
     * This is a basic implementation - full conversion requires complex phonological rules
     * 'guo3 zhi1' -> '/kuo˨˩˦ ʈ͡ʂʅ˥˥/'
     */
    function convertToIPA(pinyin) {
        // For MVP, we'll do a simplified conversion
        // Full implementation would require extensive phonological mapping
        const syllables = pinyin.trim().split(/\s+/);
        const ipaSyllables = syllables.map(syllable => {
            const { base, tone } = splitPinyinTone(syllable.toLowerCase());

            // Basic IPA approximation (this is simplified!)
            // For production, we'd need full pinyin -> IPA mapping
            let ipa = base
                .replace('zh', 'ʈ͡ʂ')
                .replace('ch', 'ʈ͡ʂʰ')
                .replace('sh', 'ʂ')
                .replace('r', 'ʐ')
                .replace('x', 'ɕ')
                .replace('j', 'tɕ')
                .replace('q', 'tɕʰ')
                .replace('z', 'ts')
                .replace('c', 'tsʰ')
                .replace('s', 's')
                .replace('i', 'i')
                .replace('u', 'u')
                .replace('ü', 'y')
                .replace('v', 'y')
                .replace('ao', 'ɑʊ̯')
                .replace('ai', 'aɪ̯')
                .replace('ei', 'eɪ̯')
                .replace('ou', 'oʊ̯')
                .replace('a', 'a')
                .replace('e', 'ə')
                .replace('o', 'o');

            // Add Chao tone letters
            if (tone && CHAO_TONES[tone]) {
                ipa += CHAO_TONES[tone];
            }

            return ipa;
        });

        return '/' + ipaSyllables.join(' ') + '/';
    }

    /**
     * Convert pinyin with diacritics to tone numbers
     * Inverse of the PinyinField converter (which goes numbers → diacritics)
     * 'bào zhǐ' -> 'bao4 zhi3'
     */
    function stripPinyinDiacritics(pinyin) {
        // Diacritic to tone number mapping
        const diacriticMap = {
            // First tone (high level)
            'ā': 'a1', 'ē': 'e1', 'ī': 'i1', 'ō': 'o1', 'ū': 'u1', 'ǖ': 'ü1',
            // Second tone (rising)
            'á': 'a2', 'é': 'e2', 'í': 'i2', 'ó': 'o2', 'ú': 'u2', 'ǘ': 'ü2',
            // Third tone (dipping)
            'ǎ': 'a3', 'ě': 'e3', 'ǐ': 'i3', 'ǒ': 'o3', 'ǔ': 'u3', 'ǚ': 'ü3',
            // Fourth tone (falling)
            'à': 'a4', 'è': 'e4', 'ì': 'i4', 'ò': 'o4', 'ù': 'u4', 'ǜ': 'ü4',
            // Neutral tone (no diacritic, but handle ü)
            'ü': 'ü5'
        };

        const syllables = pinyin.trim().split(/\s+/);
        const converted = syllables.map(syllable => {
            let result = syllable;
            let toneFound = false;

            // Check each character for diacritic
            for (let i = 0; i < syllable.length; i++) {
                const char = syllable[i];
                if (diacriticMap[char]) {
                    const replacement = diacriticMap[char];
                    // Extract vowel and tone
                    const vowel = replacement.slice(0, -1);
                    const tone = replacement.slice(-1);

                    // Replace diacritic vowel with plain vowel
                    result = result.substring(0, i) + vowel + result.substring(i + 1);
                    // Append tone number at end
                    result = result + tone;
                    toneFound = true;
                    break;
                }
            }

            // If no tone found, assume neutral tone (5)
            if (!toneFound && result.length > 0) {
                result = result + '5';
            }

            return result;
        });

        return converted.join(' ');
    }

    // Public API
    return {
        convertToZhuyin,
        convertToIPA,
        pinyinToZhuyin,
        stripPinyinDiacritics,
    };
})();

// Make available globally
window.PinyinConverter = PinyinConverter;
