/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { settings } from ".";
import { proxiesByMember, storedSystem } from "./SystemStore";
export var currentQuirk: string;
export var quirkMap = new Map();

export interface TypingQuirk {
    keyIn: string,
    keyOut: string,
    keySepIn?: string,
    keySepOut?: string,
    args?: any[],
    translate: Boolean,
    func: CallableFunction;
}

export const func = {
    substitutionQuirk(input: string, a: string, b: string, sep: string = "", sep2: string = "", args?: any[]) {
        var a_split: Array<string> = a.split(sep);
        var b_split: Array<string> = b.split(sep2);

        for (var i = 0; i < a_split.length; i++) {
            while (input.includes(a_split[i])) {
                input = input.replace(a_split[i], b_split[i]);
            }
        }
        return input;
    },

    serialSubstitutionQuirk(input: string, a: string, b: string, sep: string = "", sep2: string = "", args?: any[]) {
        var result: string = "";
        var i_split: Array<string> = input.split("");
        var a_split: Array<string> = a.split(sep);
        var b_split: Array<string> = b.split(sep2);

        for (var e = 0; e < i_split.length; e++) {
            const idx = a_split.indexOf(i_split[e]);
            var c = i_split[e];
            var aC = a_split[idx];
            if (idx !== -1) {
                c = b_split[idx];
            }
            result += c;
        }
        return result;
    },

    numericEncodingQuirk(input: string, a: string, b: string, sep: string = "", sep2: string = "", args: any[]) {
        const base: number = args[0];
        var result: string = "";
        const trimput = input.trim();
        for (var i = 0; i < trimput.length; i++) {
            result += trimput.charCodeAt(i).toString(base) + " ";
        }
        return result;
    },

    wrapQuirk(input: string, a: string, b: string, sep: string = "", sep2: string = "", args: any[]) {
        var begin: string = args[0];
        var end: string = args[1];
        return begin + input.trim() + end;
    },
    translateTo(input: string, a: string, b: string, sep: string = "", sep2: string = "", args: any[]) {
        var targetLanguage: string = args[0];
    }
};

export const Quirks = {
    karkat: {
        keyIn: "abcdefghijklmnopqrstuvwxyz",
        keyOut: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        translate: false,
        func: func.substitutionQuirk
    },
    terezi: {
        keyIn: "aAbcdeEfghiIjklmnopqrstuvwxyz",
        keyOut: "44BCD33FGH11JKLMNOPQRSTUVWXYZ",
        translate: true,
        func: func.substitutionQuirk
    },
    tavros: {
        keyIn: "",
        keyOut: "",
        translate: true,
        func: (input: string, keyIn: string, keyOut: string, keySepIn: string, keySepOut: string) => {
            const words = input.split(" ");
            var output: string = "";
            words.forEach((word: string) => {
                const L: string = word.charAt(0).toLowerCase();
                const trimmed: string = word.substring(1).toUpperCase();
                output = output + L + trimmed + " ";
            });
            return output.trim();
        }
    },
    aradia: {
        keyIn: "oO",
        keyOut: "00",
        translate: true,
        func: (input: string, keyIn: string, keyOut: string, keySepIn: string, keySepOut: string) => {
            return func.substitutionQuirk(input, keyIn, keyOut, keySepIn, keySepOut).replaceAll(/\p{P}/gu, "");
        }
    },
    sollux: {
        keyIn: "i|I|to|too|To|Too|TO|TWO|s|S",
        keySepIn: "|",
        keyOut: "ii|II|two|two|Two|Two|TWO|TWO|2|2",
        keySepOut: "|",
        translate: true,
        func: func.serialSubstitutionQuirk
    },
    nepeta: {
        keyIn: "ee|EE|for|For|FOR|per|Per|PER",
        keySepIn: "|",
        keyOut: "33|33|fur|Fur|FUR|purr|Purr|PURR",
        keySepOut: "|",
        translate: false,
        func: (input: string, keyIn: string, keyOut: string, keySepIn: string, keySepOut: string) => {
            return ":33 < " + func.substitutionQuirk(input, keyIn, keyOut, keySepIn, keySepOut);
        }
    },
    kanaya: {
        keyIn: "",
        keyOut: "",
        translate: true,
        func: (input: string, keyIn: string, keyOut: string, keySepIn: string, keySepOut: string) => {
            const words = input.split(" ");
            var output: string = "";
            words.forEach((word: string) => {
                const L: string = word.charAt(0).toUpperCase();
                const trimmed: string = word.substring(1).toLowerCase();
                output = output + L + trimmed + " ";
            });
            return output.trim();
        }
    },
    vriska: { // this is evil
        keyIn: "!|?|b|B|ate|Ate|ATE|ait|Ait|AIT|aight|Aight|AIGHT|eight|Eight|EIGHT",
        keySepIn: "|",
        keyOut: "!!!!!!!!|????????|8|8|8|8|8|8|8|8|8|8|8|8|8|8",
        keySepOut: "|",
        translate: true,
        func: func.serialSubstitutionQuirk
    },
    gamzee: {
        keyIn: "",
        keyOut: "",
        keySepOut: ",",
        translate: true,
        func: (input: string) => {
            var result: string = "";
            for (var i = 0; i < input.length; i++) {
                var c: string = input.charAt(i).toLowerCase();
                if (i % 2 == 0) {
                    c = c.toUpperCase();
                }
                result += c;
            }
            return result;
        }
    },
    equius: {
        keyIn: "ool|Ool|OOL|loo|Loo|LOO",
        keySepIn: "|",
        keyOut: "001|001|001|100|100|100",
        keySepOut: "|",
        translate: false,
        func: (input: string, keyIn: string, keyOut: string, keySepIn: string, keySepOut: string) => {
            return "D--> " + func.substitutionQuirk(input, keyIn, keyOut, keySepIn, keySepOut);
        }
    },
    eridan: {
        keyIn: "w|W|v|V|FOR|ing|ING|PER",
        keySepIn: "|",
        keyOut: "ww|WW|vv|VV|in|IN|Purr|PURR",
        keySepOut: "|",
        translate: false,
        func: (input: string, keyIn: string, keyOut: string, keySepIn: string, keySepOut: string) => {
            return func.serialSubstitutionQuirk(input, keyIn, keyOut, keySepIn, keySepOut).replaceAll(/\p{P}/gu, "").toLowerCase();
        }
    },
    feferi: {
        keyIn: "h|H|E",
        keySepIn: "|",
        keyOut: ")(|)(|-E|38)",
        keySepOut: "|",
        translate: true,
        func: func.substitutionQuirk
    }
};

export async function populateQuirks() {
    const rawJSON = settings.store.typingQuirkJson;
    const flatJSON = rawJSON.replace(/[\r\n\t\f\v]/g, "");
    const parsedJSON = JSON.parse(flatJSON);
    console.log(rawJSON);
    console.log(flatJSON);
    console.log(parsedJSON);
    for (const key in parsedJSON) {
        const quirk: TypingQuirk = { keyIn: "", keyOut: "", translate: true, func: func.substitutionQuirk };
        const quirkJSON = parsedJSON[key];
        const keyType = typeof quirkJSON;
        if (keyType === "object") {
            for (const k in quirkJSON) {
                if (k === "customFunction") { // custom function always takes priority over built-ins
                    const rawFunc = quirkJSON[k];
                    console.log(rawFunc);
                    const parseFunc = new Function("input", "keyIn", "keyOut", "keySepIn", "keySepOut", "args", rawFunc);
                    quirk.func = parseFunc;
                }
                else if (k.startsWith("func")) {
                    if (quirkJSON[k] in func) {
                        quirk.func = func[quirkJSON[k]];
                    }
                }
                else {
                    quirk[k] = quirkJSON[k];
                }
            }
            console.log(applyQuirk("the quick brown fox jumps over the lazy dog! :)", quirk));
            quirkMap.set(key, quirk);
        }
        else if (keyType === "string") {
            if (quirkJSON in Quirks) {
                console.log(applyQuirk("the quick brown fox jumps over the lazy dog! :)", Quirks[quirkJSON]));
                quirkMap.set(key, Quirks[quirkJSON]);
            }
        }
    }
    for (const key in Quirks) {
        console.log(applyQuirk(key + ": the quick brown fox jumps over the lazy dog! :)", Quirks[key]));
    }
    console.log(quirkMap);
}
/* export async function populateQuirks(){
    var quirkStrSplit = settings.store.typingQuirkJson.split("\n")
    quirkStrSplit.forEach((quirk) => {
        var keySplit = quirk.split("=>")
        quirkMap.set(keySplit[0].trim(),keySplit[1])
    })
}*/

/* export async function quirkifyText(str:string){
    var quirky = str
    quirkMap.forEach((f,proxy) => {
        var proxySplit = proxy.split("text")
        if (str.startsWith(proxySplit[0]) && str.endsWith(proxySplit[1])) {
            if (settings.store.typingQuirks === "TQlatch") {autoQuirk = f}

            quirky = proxySplit[0] + applyQuirk(str.replace(RegExp("^"+proxySplit[0]),"").replace(RegExp(proxySplit[1]+"$"),""),Quirks[f]) + proxySplit[1]
            console.log(quirky)
        }
        quirkMap.set(key, quirk);
        console.log(applyQuirk("this is a test", quirk));
    })
    console.log(quirkMap);
    var quirkStrSplit = settings.store.typingQuirkJson.split("\n");
    quirkStrSplit.forEach((quirk) => {
        var keySplit = quirk.split("=>");
        quirkMap.set(keySplit[0].trim(), keySplit[1].trim());
    });
}*/

var autoQuirk = "📻text";

export async function quirkifyText(str: string) {
    if (settings.store.typingQuirks === "TQoff") { return str; }
    var quirky = str;

    quirkMap.forEach((quirk, proxy) => {
        var proxySplit = proxy.split("text");
        if (str.startsWith(proxySplit[0]) && str.endsWith(proxySplit[1])) {
            console.log(proxy, ":", quirk);
            if (settings.store.typingQuirks === "TQlatch") { autoQuirk = proxy; }
            quirky = proxySplit[0] + applyQuirk(str.replace(RegExp("^" + proxySplit[0]), "").replace(RegExp(proxySplit[1] + "$"), ""), quirkMap.get(proxy)) + proxySplit[1];
            console.log(applyQuirk(str, quirkMap.get(proxy)));
        }
    });

    if (settings.store.typingQuirks === "TQfront") {
        const firstFronter: string = storedSystem.fronters?.members?.keys().next().value;
        console.log(firstFronter);
        const fronterProxy: string = proxiesByMember.get(firstFronter);
        console.log(fronterProxy);
        autoQuirk = fronterProxy;
    }
    if (quirky === str) {
        quirky = applyQuirk(str, quirkMap.get(autoQuirk));
    }
    return quirky;
}

export function applyQuirk(str: string, quirk: TypingQuirk) {
    if (quirk === null || quirk === undefined) { return str; }

    var output = quirk.func(str, quirk.keyIn, quirk.keyOut, quirk.keySepIn, quirk.keySepOut, quirk.args);
    if (quirk.translate) { output = output + " \n> " + str; }
    return output;
}
