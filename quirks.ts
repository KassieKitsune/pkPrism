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
    }
};

export const Quirks = {
    hexQuirk: {
        keyIn: "",
        keyOut: "",
        keySepOut: ",",
        translate: true,
        func: func.numericEncodingQuirk
    },
    capsQuirk: {
        keyIn: "abcdefghijklmnopqrstuvwxyz",
        keyOut: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        translate: false,
        func: func.substitutionQuirk
    },
    lowerQuirk: {
        keyOut: "abcdefghijklmnopqrstuvwxyz",
        keyIn: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        translate: false,
        func: func.substitutionQuirk
    },
    nepQuirk: {
        keyIn: "ee|EE",
        keySepIn: "|",
        keyOut: "33|33",
        keySepOut: "|",
        translate: false,
        func: (input: string, keyIn: string, keyOut: string, keySepIn: string, keySepOut: string) => {
            return ":33 < " + func.substitutionQuirk(input, keyIn, keyOut, keySepIn, keySepOut);
        }
    },
    radioQuirk: {
        keyIn: "",
        keySepIn: "",
        keyOut: "",
        keySepOut: "",
        translate: false,
        func: (input: string) => {
            const options = ["~/bzzt~ ", "~/krrk~ ", "~//!~ "];
            return "~∿/" + input.trim() + "/∿~";
        }
    },
    altQuirk: {
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
            console.log(applyQuirk("this is a test", quirk));
            quirkMap.set(key, quirk);
        }
        else if (keyType === "string") {
            if (quirkJSON in Quirks) {
                console.log(applyQuirk("this is a test", Quirks[quirkJSON]));
                quirkMap.set(key, Quirks[quirkJSON]);
            }
        }
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
