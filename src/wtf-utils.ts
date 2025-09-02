//----------------------------------------
// WTF UTILS
//----------------------------------------

import { escapeRegexp } from './regexp-utils'
import { C } from './logger-utils'
import { isset } from './isset'

export function chineseProverb() {
    // no spoil man
    const str = 'Aécrçsçséçséènéopporùunçùyérçdçngéùhàédèngàrouséwçnd$Iù\'sébàùùàréùoébàéwçùhouùéèébookéùhènéùoébàlçàvàéèébookéànùçràly$Aélçùùlàéçmpèùçàncàéwçlléspoçlégràèùéplèns$Tèlkédoàsénoùécookérçcà$Aénààdlàéçsénoùéshèrpéèùéboùhéànds$Thàébàsùéùçmàéùoéplènùéèéùrààéwèsé20éyàèrséègo.éThàésàcondébàsùéùçmàéçséùodèy$Inéèégroupéofémènyéwords,éùhàràéçséboundéùoébàéèémçsùèkàésomàwhàràéçnéùhàm$Pèùçàncàéçséèébçùùàréplènù,ébuùéçùséfruçùéçséswààù$Twoégoodéùèlkàrséèràénoùéworùhéonàégoodélçsùànàr$Aéhundràdéno\'séèràélàsséègonçzçngéùhènéonàéçnsçncàràéyàs$Hàéwhoéchàèùséùhàéàèrùhéwçllébàéchàèùàdébyéùhàéàèrùh'
    return ['é ', 'àe', 'èa', 'ùt', 'çi'].reduce((s, e) => s.replace(new RegExp(e[0], 'g'), e[1]), str).split('$')[Math.floor(Math.random() * 11)]
}

export function randomEmoji(msg: string, length = 20) {
    const o = `\u0298\u203f\u0298§\u0ca0\u005f\u0ca0§\u0028\uff61\u25d5\u203f\u25d5\uff61\u0029§\uff08\u3000\uff9f\u0414\uff9f\uff09§\u0028\u256c\u0020\u0ca0\u76ca\u0ca0\u0029§\u0ca0\u203f\u0ca0§\u0028\u0020\u0361\u00b0\u0020\u035c\u0296\u0020\u0361\u00b0\u0029§\u0ca5\u005f\u0ca5§\u0ca5\ufe4f\u0ca5§\u2299\ufe4f\u2299§\u00b0\u203f\u203f\u00b0§\u0028\u00b4\uff65\u005f\uff65\u0060\u0029§\u0c20\u005f\u0c20§\u0028\u2299\u005f\u25ce\u0029§\u30df\u25cf\ufe4f\u2609\u30df§\u0028\u0ca5\u2323\u0ca5\u0029§\u0028\u0e51\u2022\u0301\u0020\u2083\u0020\u2022\u0300\u0e51\u0029§\u25d4\u005f\u25d4§\u2665\u203f\u2665§\u0028\u0020\u02d8\u0020\u00b3\u02d8\u0029\u2665§\u0028\u0020\u02c7\u0df4\u02c7\u0020\u0029§\u0028\u0482\u25e1\u005f\u25e1\u0029§\u2940\u002e\u2940§\u0028\u2a7e\ufe4f\u2a7d\u0029§\u0028\u0020\u0c20\u0020\u035f\u0296\u0020\u0c20\u0029§\u0028\u0020\u0361\u0ca0\u0020\u0296\u032f\u0020\u0361\u0ca0\u0029§\u0028\u0020\u0ca0\u0020\u0296\u032f\u0020\u0ca0\u0029§\u2668\u005f\u2668§\u0028\u002e\u005f\u002e\u0029§\ub208\u005f\ub208§\u0028\u25e0\ufe4f\u25e0\u0029§\u25d6\u1d54\u1d25\u1d54\u25d7\u0020\u266a\u0020\u266b§\u007b\u2022\u0303\u005f\u2022\u0303\u007d§\u0028\u1d54\u1d25\u1d54\u0029§\u0028\u053e\u2038\u0020\u053e\u0029§\u00af\u005c\u005f\u0028\u30c4\u0029\u005f\u002f\u00af§\u00af\u005c\u0028\u00b0\u005f\u006f\u0029\u002f\u00af§\u00af\u005c\u005f\u0028\u2299\ufe3f\u2299\u0029\u005f\u002f\u00af§\u0505\u0028\u2256\u203f\u2256\u0505\u0029§\u10da\u0028\uff40\u30fc\u00b4\u10da\u0029§\u261c\u0028\u2312\u25bd\u2312\u0029\u261e§\u30fd\u0028\u00b4\u25bd\u0060\u0029\u002f§\u30fd\u0028\u00b4\u30fc\uff40\u0029\u30ce§\u1559\u0028\u21c0\u2038\u21bc\u2036\u0029\u1557§\u1566\u0028\u00f2\u005f\u00f3\u02c7\u0029\u1564§\u2282\u0028\u25c9\u203f\u25c9\u0029\u3064§\u0071\u0028\u2742\u203f\u2742\u0029\u0070§\u00bf\u24e7\u005f\u24e7\ufb8c§\u0028\u2299\u002e\u2609\u0029§\u0449\uff08\uff9f\u0414\uff9f\u0449\uff09§\u0669\u0028\u0e4f\u005f\u0e4f\u0029\u06f6§\u0074\u0028\u002d\u005f\u002d\u0074\u0029§\u0028\u3065\uffe3\u0020\u00b3\uffe3\u0029\u3065§\u0028\u3065\uff61\u25d5\u203f\u203f\u25d5\uff61\u0029\u3065§\u201c\u30fd\u0028\u00b4\u25bd\uff40\u0029\u30ce\u201d§\u250c\u0028\u3186\u3268\u3186\u0029\u0283§\u0028\u2283\uff61\u2022\u0301\u203f\u2022\u0300\uff61\u0029\u2283§\u0028\u3063\u02d8\u06a1\u02d8\u03c2\u0029§\u0028\u0e07\u30c4\u0029\u0e27§\u30fe\u0028\u002d\u005f\u002d\u0020\u0029\u309e§\u266a\u266a\u0020\u30fd\u0028\u02c7\u2200\u02c7\u0020\u0029\u309e§\u30fe\u0028\u00b4\u3007\u0060\u0029\uff89\u266a\u266a\u266a§\u0028\u3063\u2580\u00af\u2580\u0029\u3064§\u0028\u00b4\u0436\uff40\u03c2\u0029§\u0028\u00b0\u0020\u035c\u0296\u0361\u00b0\u0029\u256d\u2229\u256e§\u062d\u0028\u2022\u0300\u0436\u2022\u0301\u0029\u0e07\u0020\u2020§\u007e\u0028\u005e\u002d\u005e\u0029\u007e§\u005c\u0028\u1d54\u1d55\u1d54\u0029\u002f§\u10da\u0028\u2022\u0301\u2022\u0301\u10da\u0029§\u0028\u0e07\u2019\u0300\u002d\u2018\u0301\u0029\u0e07§\u0028\u2022\u0300\u1d17\u2022\u0301\u0029\u0648\u0020\u0311\u0311§\u005b\u00ac\u00ba\u002d\u00b0\u005d\u00ac§\u0028\u261e\uff9f\u30ee\uff9f\u0029\u261e§\u00bb\u2310\u0028\u0ca0\u06fe\u0ca0\u0029\u00ac\u0020\u00bb\u2019§\u0028\u3063\u2022\u0301\uff61\u2022\u0301\u0029\u266a\u266c§\u01aa\u0028\u0693\u05f2\u0029\u200e\u01aa\u200b\u200b§\u0295\u2022\u1d25\u2022\u0294§\u0295\u1d54\u1d25\u1d54\u0294§\u0295\u0020\u2022\u0060\u1d25\u2022\u00b4\u0294§\u0295\u0020\u2022\u0301\u0608\u2022\u0300\u0020\u208e§\u0028\u0060\uff65\u03c9\uff65\u00b4\u0029§\u1d52\u1d25\u1d52§\u0056\u2022\u1d25\u2022\u0056§\u0e05\u005e\u2022\ufecc\u2022\u005e\u0e05§\u0028\u0020\u0c20\u0d60\u0c20\u0020\u0029\uff89§\u0295\u0298\u0305\u035c\u0298\u0305\u0294§\u062d\u02da\u0bf0\u02da\u3065§\u0028\u256f\u00b0\u25a1\u00b0\uff09\u256f\ufe35\u0020\u253b\u2501\u253b§\u252c\u2500\u252c\ufeff\u0020\u30ce\u0028\u0020\u309c\u002d\u309c\u30ce\u0029§\u252c\u2500\u252c\u20f0\u0361\u2007\u0028\u1d54\u1d55\u1d54\u035c\u2007\u0029§\u253b\u2501\u253b\u0020\ufe35\u30fd\u0028\u0060\u0414\u00b4\u0029\uff89\ufe35\ufeff\u0020\u253b\u2501\u253b§\u0028\u30ce\u0ca0\u0020\u2229\u0ca0\u0029\u30ce\u5f61\u0028\u0020\u005c\u006f\u00b0\u006f\u0029\u005c§\uff08\u0020\u005e\u005f\u005e\uff09\u006f\u81ea\u81ea\u006f\uff08\u005e\u005f\u005e\u0020\uff09§\u0f3c\u2235\u0f3d§\u0f3c\u2368\u0f3d§\u0f3c\u2362\u0f3d§\u0f3c\u2364\u0f3d§\u30fd\u0f3c\u0020\u0ca0\u76ca\u0ca0\u0020\u0f3d\uff89§\u4e41\u0028\u0020\u25d4\u0020\u0c6a\u25d4\u0029\u300c§\u0028\u2229\uff40\u002d\u00b4\u0029\u2283\u2501\u2606\uff9f\u002e\u002a\uff65\uff61\uff9f`.split('§')[Math.floor(Math.random() * 100)]
    return o.padEnd(length, ' ') + (msg ? '< ' + msg : '')
}

type CompObject = { char: string, replacement: string }

/** STRING COMPRESSOR
 * peut facilement être utilisé par uncomp directement (stock les metadonnées sur la comp)
 */
export function compAuto(str: string) {

    const oldStrLength = str.length
    const utf8Chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ:;<=>%?@"#$&\'()*+,-./[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\u007f€\u0081‚ƒ„…†‡ˆ‰Š‹ŒŽ\u008f‘’“”•–—˜™š›œžŸ ¡¢£¤¥¦¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŔŕŖŗŘřŚśŜŝŞşŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŹźŻżſƀƁƂƃƄƅƆƇƈƉƊƋƌƍƎƏƐƑƓƔƕƖƗƘƙƚƛƜƝƞƟ'.split('')


    const unusedChars = utf8Chars.filter(c => !str.includes(c))
    const charMap: CompObject[] = []

    const mostFreqStr = (str2: string) => {
        const o = {} as Record<string, any>
        // recherche la meilleure optim selon le nb de char
        for (let strLength = 2; strLength < 16; strLength++) {
            for (let i = 0; isset(str2[i + strLength - 1]); i++) {
                let s = ''
                while (s.length < strLength) s += str2[i + s.length]
                o[s] = !isset(o[s]) ? -2 : o[s] + strLength - 1 // nb of char economised (the first == -2 because this is space for mapping)
            }
        }
        return Object.keys(o) // {'aa':12, 'ab':8}
            .filter(subStr => o[subStr] > subStr.length + 2) // will not be comp if charEconomised != substr.length
            .sort((a, b) => o[b] - o[a])[0]
    }

    // on trouve les [deepness] double char les plus représentés ['aa', 'bb'...]
    // on les remplace le nb de [recursion], ce qui permet de remplacer des remplacements
    let strLengthBefore
    while (strLengthBefore !== str.length && unusedChars.length > 0) {
        strLengthBefore = str.length
        const toReplace = mostFreqStr(str)
        if (isset(toReplace)) {
            const char: string = unusedChars.shift() as any
            charMap.push({ char, replacement: toReplace }) // { ù: 'aa' }
            str = str.replace(new RegExp(escapeRegexp(toReplace), 'g'), char)
        }
    }

    for (const { char, replacement } of charMap) {
        // rrrr => rƠ4
        const reg = replacement.length > 3 && replacement.split('').every((char2, _, a) => char2 == a[0]) ? `${replacement[0]}Ơ${replacement.length}` : replacement
        str = `${char}${reg}§` + str
    }
    C.info(`COMP percentage: ${Math.round((str.length / oldStrLength) * 100)}% of its original size`)
    return str
}

export function unComp(str: string) {
    const charMap: CompObject[] = []
    const map = str.split('§')
    str = map.pop() as string
    map.forEach(e => {
        const char: string = e[0]
        let replacement = e.substring(1, 999)
        if (replacement.includes('Ơ')) {
            const [char, nb] = replacement.split('Ơ') as [string, string]
            replacement = char.repeat(parseInt(nb))
        }
        charMap.push({ char, replacement })
    })

    charMap.forEach(({ char, replacement }) =>
        str = str.replace(new RegExp(escapeRegexp(char), 'g'), replacement) // regexp excape
    )

    return str
}