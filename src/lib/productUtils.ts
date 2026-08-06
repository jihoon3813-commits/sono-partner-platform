export function cleanProductName(name: string, brand?: string): string {
    if (!name) return "";
    let str = name.trim();

    // 1. [LG] LG전자 ... / [삼성] 삼성전자 ... / [애플] Apple ... 등 브랜드명 및 자회사/대소문자 중복 처리
    const match = str.match(/^\[([^\]]+)\]\s*(.*)/);
    if (match) {
        const tag = match[1].trim();
        let rest = match[2].trim();

        const synonyms: Record<string, string[]> = {
            "삼성": ["삼성", "삼성전자", "SAMSUNG"],
            "LG": ["LG", "LG전자", "엘지전자", "엘지"],
            "애플": ["애플", "Apple", "APPLE"],
            "쿠쿠": ["쿠쿠", "CUCKOO"],
            "에스테오": ["에스테오", "ESTEO"],
            "세라젬": ["세라젬", "CERAGEM"],
            "바디프랜드": ["바디프랜드", "BODYFRIEND"],
            "브람스": ["브람스", "BRAMS"],
            "드리미": ["드리미", "DREAME"],
            "로보락": ["로보락", "ROBOROCK"],
            "소노시즌": ["소노시즌", "SONOSEASON"],
            "아츠아크": ["아츠아크", "ARTSARK"],
            "블룸즈베리": ["블룸즈베리", "BLOOMSBURY"],
            "위닉스": ["위닉스", "WINIX"]
        };

        const checkList = Array.from(new Set([tag, `${tag}전자`, ...(synonyms[tag] || [])]))
            .sort((a, b) => b.length - a.length);

        for (const word of checkList) {
            const regex = new RegExp(`^${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i');
            if (regex.test(rest)) {
                rest = rest.replace(regex, '');
                break;
            }
        }
        return `[${tag}] ${rest}`;
    }

    // 2. [태그]가 없는 경우: 브랜드명이 맨 앞에 붙어있으면 [브랜드] 태그 처리
    if (brand && brand !== "기타") {
        const regex = new RegExp(`^${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i');
        if (regex.test(str)) {
            str = str.replace(regex, '');
        }
        return `[${brand}] ${str}`;
    }

    return str;
}
