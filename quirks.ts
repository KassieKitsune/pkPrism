import { parse } from "path";
import { settings } from ".";
import { membersByProxy, proxiesByMember, storedSystem } from "./SystemStore";
import { ProxyTag, Switch, System, Member as pkMember } from "pkapi.js";

export var currentQuirk: string;
export var quirkMap = new Map();

export interface TypingQuirk {
    keyIn: string,
    keyOut: string,
    keySepIn?: string,
    keySepOut?: string,
    args?: Array<any>,
    translate: Boolean,
    func: CallableFunction;
}

export const Quirks = {
    hexQuirk: {
        keyIn: "",
        keyOut: "",
        keySepOut: ",",
        translate: true,
        func: (input: string) => {
            var result: string = "";
            var trimput = input.trim();
            for (var i = 0; i < trimput.length; i++) {
                result += trimput.charCodeAt(i).toString(16) + " ";
            }
            return result;
        }
    },
    capsQuirk: {
        keyIn: "abcdefghijklmnopqrstuvwxyz",
        keyOut: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        translate: false,
        func: substitutionQuirk
    },
    lowerQuirk: {
        keyOut: "abcdefghijklmnopqrstuvwxyz",
        keyIn: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        translate: false,
        func: substitutionQuirk
    },
    nepQuirk: {
        keyIn: "ee|EE",
        keySepIn: "|",
        keyOut: "33|33",
        keySepOut: "|",
        translate: false,
        func: (input: string, keyIn: string, keyOut: string, keySepIn: string, keySepOut: string) => {
            return ":33 < " + substitutionQuirk(input, keyIn, keyOut, keySepIn, keySepOut);
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
    const parsedJSON = JSON.parse(settings.store.typingQuirkJson);
    console.log(parsedJSON);
    for (let key in parsedJSON) {
        const quirk: TypingQuirk = { keyIn: "", keyOut: "", translate: true, func: substitutionQuirk };
        const quirkJSON = parsedJSON[key];
        for (let k in quirkJSON) {
            if (k === "customFunction") {
                const rawFunc = quirkJSON[k];
                console.log(rawFunc);
                const parseFunc = new Function('input', 'keyIn', 'keyOut', 'keySepIn', 'keySepOut', 'args', rawFunc);
                quirk.func = parseFunc;
            }
            else if (k.startsWith("func")) {
                quirk.func = this[quirkJSON[k]];
            }
            else {
                quirk[k] = quirkJSON[k];
            }
        }
    }
}
/*export async function populateQuirks(){
    var quirkStrSplit = settings.store.typingQuirkJson.split("\n")
    quirkStrSplit.forEach((quirk) => {
        var keySplit = quirk.split("=>")
        quirkMap.set(keySplit[0].trim(),keySplit[1])
    })
}*/

var autoQuirk = ""

export async function quirkifyText(str:string){
    var quirky = str
    quirkMap.forEach((f,p) => {
        var proxySplit = p.split("text")
        if (str.startsWith(proxySplit[0]) && str.endsWith(proxySplit[1])) {
            if (settings.store.typingQuirks === "TQlatch") {autoQuirk = f}

            quirky = proxySplit[0] + applyQuirk(str.replace(RegExp("^"+proxySplit[0]),"").replace(RegExp(proxySplit[1]+"$"),""),Quirks[f]) + proxySplit[1]
            console.log(quirky)
        }
        quirkMap.set(key, quirk);
        console.log(applyQuirk("this is a test", quirk));
    }
    console.log(quirkMap);
    /*var quirkStrSplit = settings.store.typingQuirkJson.split("\n");
    quirkStrSplit.forEach((quirk) => {
        var keySplit = quirk.split("=>");
        quirkMap.set(keySplit[0].trim(), keySplit[1].trim());
    });*/
}

var autoQuirk = "";

export async function quirkifyText(str: string) {
    var quirky = str;
    quirkMap.forEach((f, p) => {
        var proxySplit = p.split("text");
        if (str.startsWith(proxySplit[0]) && str.endsWith(proxySplit[1])) {
            if (settings.store.typingQuirks === "TQlatch") { autoQuirk = f; }

            quirky = proxySplit[0] + applyQuirk(str.replace(RegExp("^" + proxySplit[0].trim), "").replace(RegExp(proxySplit[1] + "$"), ""), quirkMap[f]) + proxySplit[1];
            console.log(quirky);
        }
    });
    if (settings.store.typingQuirks === "TQoff") { return str; }

    if (settings.store.typingQuirks === "TQfront") {
        const firstFronter: string = storedSystem.fronters?.members?.keys().next().value;
        const fronterProxy: string = proxiesByMember.get(firstFronter);
        autoQuirk = quirkMap.get(fronterProxy);
    }
    if (quirky === str) {
        quirky = applyQuirk(str, quirkMap[autoQuirk]);
    }
    return quirky;
}

export function applyQuirk(str: string, quirk: TypingQuirk) {
    var output = quirk.func(str, quirk.keyIn, quirk.keyOut, quirk.keySepIn, quirk.keySepOut, quirk.args);
    if (quirk.translate) { output = output + " \n> " + str; }
    return output;
}

function substitutionQuirk(input: string, a: string, b: string, sep: string = "", sep2: string = "") {
    var a_split: Array<string> = a.split(sep);
    var b_split: Array<string> = b.split(sep2);

    for (var i = 0; i < a_split.length; i++) {
        while (input.includes(a_split[i])) {
            input = input.replace(a_split[i], b_split[i]);
        }
    }
    return input;
}

function serialSubstitutionQuirk(input: string, a: string, b: string, sep: string = "", sep2: string = "") {
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
}

