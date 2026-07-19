/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { definePluginSettings } from "@api/Settings";
import { MessageObject } from "@api/MessageEvents";
import { hexToHSL } from "@plugins/clientTheme/utils/colorUtils";

import definePlugin, { OptionType } from "@utils/types";
import { PluginNative } from "@utils/types";
import { Member as pkMember, Switch, System } from "pkapi.js";

import { updateMessage } from "@api/MessageUpdater";

import { applyQuirk, populateQuirks, quirkifyText, quirkMap, Quirks, QuirkMap, TypingQuirk } from "./quirks";
import { updateFrontActivity } from "./fronterRPC";
import { getSystemData, storedProxies, storedSystem } from "./SystemStore";

export const Native = VencordNative.pluginHelpers.pkPrism as PluginNative<typeof import("./native")>;

var apiDelay = 0;
const apiDelayStep = 200;

export const PLURALKIT_BOT_ID = "466378653216014359";

const cachedPKColors = new Map();

const queuedNames = new Array<String>;
const queuedMessages = new Array<String>;
const queuedChannel = new Array<String>;

const Devs = Object.freeze({
    KassieKitsune: {
        name: "Philosopher's Stone System",
        id: 173066847887949825n
    }
});

export const settings = definePluginSettings({
    pkToken: {
        description: "Required for some functions (never share this with anyone)",
        type: OptionType.STRING,
        default: ""
    },
    minLightness: {
        description: "Minimium lightness, in %. Change if colors are too light or too dark",
        type: OptionType.SLIDER,
        markers: [0, 10, 20, 25, 30, 40, 50, 60, 75, 80, 85, 90, 100],
        default: 0,
        stickToMarkers: false
    },
    maxLightness: {
        description: "Maxium Lightness, in %. Change if colors are too light or too dark",
        type: OptionType.SLIDER,
        markers: [0, 10, 20, 25, 30, 40, 50, 60, 75, 80, 85, 90, 100],
        default: 100,
        stickToMarkers: false
    },
    defaultColor: {
        description: "#Hex color to display for Pluralkit Members without a color set (leave blank for Discord/Theme defaults)",
        type: OptionType.STRING,
        default: "#FF00FF"
    },
    generateRandomColors: {
        displayName: "ID Colors",
        description: "If true, generates colors based on a member's ID if no color is set",
        restartNeeded: true,
        type: OptionType.BOOLEAN,
        default: false
    },
    idSaturation: {
        description: "Saturation to use for ID colors (-1 for no adjustment)",
        type: OptionType.NUMBER,
        restartNeeded: true,
        default: 25,
    },
    frontingPresence: {
        displayName: "Rich Presence",
        description: "Show the first fronter as an Activity on your profile",
        type: OptionType.SELECT,
        restartNeeded: true,
        options: [
            { label: "OFF", value: "RPCoff", default: true },
            { label: "Standard", value: "RPCstandard" },
            { label: "Covert", value: "RPCcovert" },
            { label: "Custom", value: "RPCcustom" }
        ]
    },
    showPronounsInRichPresence: {
        description: "",
        type: OptionType.BOOLEAN,
        default: false
    },
    presenceDisplayName: {
        displayName: "Use Display Name in Presence",
        description: "If true use the fronter's displayname instead of their name (if set)",
        type: OptionType.BOOLEAN,
        default: true
    },
    presenceName: {
        displayName: "Presence Line 1",
        description: "Insert details using [system_name], [name], [display_name], [pronouns], [member_id], [system_id]",
        type: OptionType.STRING,
        default: "[display_name] ([pronouns])"
    },
    presenceDetail: {
        displayName: "Presence Line 2",
        description: "",
        type: OptionType.STRING,
        default: "[system_name]"
    },
    presenceState: {
        displayName: "Presence Line 3",
        description: "",
        type: OptionType.STRING,
        default: "Via pkPrism"
    },
    presenceImageLink: {
        description: "",
        type: OptionType.STRING,
        default: "https://dash.pluralkit.me/profile/m/[member_id]"
    },
    presenceDetailLink: {
        description: "",
        type: OptionType.STRING,
        default: "https://dash.pluralkit.me/profile/s/[system_id]"
    },
    presenceStateLink: {
        description: "",
        type: OptionType.STRING,
        default: "https://github.com/KassieKitsune/pkPrism"
    },
    typingQuirks: {
        description: "",
        type: OptionType.SELECT,
        restartNeeded: true,
        options: [
            { label: "OFF", value: "TQoff", default: true },
            { label: "Manual", value: "TQman" },
            { label: "Latch", value: "TQlatch" },
            { label: "Front", value: "TQfront" }
        ]
    },
    typingQuirkJson: {
        displayName: "Typing Quirk Map",
        description: "",
        type: OptionType.STRING,
        restartNeeded: true,
        multiline: true,
        default: "🖳text => hexQuirk",
        placeholder: "🖳text => hexQuirk"
    },
}, {
    idSaturation: {
        hidden() { return !this.store.generateRandomColors; }
    },
    presenceDisplayName: {
        hidden() { return this.store.frontingPresence !== "RPCstandard" && this.store.frontingPresence !== "RPCcovert"; }
    },
    showPronounsInRichPresence: {
        hidden() { return this.store.frontingPresence !== "RPCstandard"; }
    },
    presenceName: {
        hidden() { return this.store.frontingPresence !== "RPCcustom"; }
    },
    presenceDetail: {
        hidden() { return this.store.frontingPresence !== "RPCcustom"; }
    },
    presenceState: {
        hidden() { return this.store.frontingPresence !== "RPCcustom"; }
    },
    presenceImageLink: {
        hidden() { return this.store.frontingPresence !== "RPCcustom"; }
    },
    presenceDetailLink: {
        hidden() { return this.store.frontingPresence !== "RPCcustom"; }
    },
    presenceStateLink: {
        hidden() { return this.store.frontingPresence !== "RPCcustom"; }
    }
}
);

export default definePlugin({
    name: "pkPrism",
    description: "PluralKit integrations for Vencord",
    tags: ["Appearance", "Customisation", "Accessibility"],
    authors: [Devs.KassieKitsune],
    settings,

    patches: [
        {
            find: '="SYSTEM_TAG"',
            replacement: {
                // Override colorString with our custom color and disable gradients if applying the custom color.
                match: /(?<=colorString:\i,colorStrings:\i,colorRoleName:\i.*?}=)(\i),/,
                replace: "$self.wrapMessageColorProps($1, arguments[0]),"
            }
        }
    ],


    start() {
        startup();
    },

    stop() {
    },

    onBeforeMessageSend(_, msg) {
        updateFrontOnMessage(msg); // we do this this way to briefly wait for pluralkit to log the switch before we do
        var doQuirk: string | null = null;
        if (msg.content.startsWith("pk;")) {
            doQuirk = null;
        }
        else {
            addTypingQuirk(msg, Quirks.hexQuirk);
        }
    },

    onMessageClick(message) {
        if (message.applicationId === PLURALKIT_BOT_ID) { pkRecordMessageMemberColorRateLimited(message.id, message.author.username, message.channel_id); }
    },

    wrapMessageColorProps(colorProps: { colorString: string, colorStrings?: Record<"primaryColor" | "secondaryColor" | "tertiaryColor", string>; }, context: any) {
        try {
            const colorString = this.calculateNameColorForMessageContext(context);
            if (colorString === colorProps.colorString) {
                return colorProps;
            }

            return {
                ...colorProps,
                colorString,
                colorStrings: colorProps.colorStrings && {
                    primaryColor: colorString,
                    secondaryColor: undefined,
                    tertiaryColor: undefined
                }
            };
        } catch (e) {
            console.error("Failed to calculate message color strings:", e);
            return colorProps;
        }
    },

    calculateNameColorForMessageContext(context: any) {
        const colorString = context?.author?.colorString;
        const username = context?.message?.author?.username;
        const avatar = context?.message?.author?.avatar;

        if (context?.message?.applicationId === PLURALKIT_BOT_ID && context?.message?.webhookID !== null) {
            const cachedColor = cachedPKColors.get(username);
            if (cachedColor === null) { return settings.store.defaultColor; }
            if (cachedColor === undefined) {
                //if (queuedNames.indexOf(username) === -1){
                queuedNames.push(username);
                queuedMessages.push(context?.message?.id);
                queuedChannel.push(context?.channel?.id);
                if (queuedNames.length == 1) {
                    getQueuedColor();
                }
                //}
                //else{
                //updateMessageDelayed(context?.message?.id,context?.channel?.id)
                //}

                return settings.store.defaultColor;
            }
            return "#" + adjustColor(cachedPKColors.get(username));
        }

        return colorString;
    }

});

async function startup() {
    //await getSystemData();
    if (settings.store.frontingPresence !== "RPCoff") {
        //await getSystemData();
        updateFrontActivity();
        setInterval(() => { updateFrontActivity(); }, 300000);
    }
    populateQuirks();
}

async function getQueuedColor() {
    const messageID = queuedMessages.pop();
    const channelID = queuedChannel.pop();
    const name = queuedNames.pop();
    const cachedColor = cachedPKColors.get(name);
    console.log(apiDelay)
    if (cachedColor === undefined) {
        console.log(messageID, channelID, name);
        await pkRecordMessageMemberColorRateLimited(messageID, name, channelID);
        updateMessage(channelID, messageID);

        if (queuedNames.length > 0) {
            await sleep(apiDelayStep);
            getQueuedColor();
        }
    }
    else {
        updateMessage(channelID, messageID);
        if (queuedNames.length > 0) {
            getQueuedColor();
        }
    }
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateMessageDelayed(m_id: string, ch_id: string, delay: number = apiDelay * 2) {
    await sleep(delay);
    updateMessage(ch_id, m_id);
}

async function pkRecordMessageMemberColorRateLimited(messageID: string, username: string, channelID?: string) {
    //cachedPKColors.set(username,settings.store.defaultColor)


    /*{
        apiDelay += apiDelayStep;
        await sleep(apiDelay);
        apiDelay -= apiDelayStep;
    }*/// still do this to delay color updates for non-querrying messages

    const message = await Native.pkMessageRequest(messageID);

    if (message !== undefined) {
        const member: pkMember = message.member;
        var color = member.color;

        if (settings.store.generateRandomColors && color === null) {
            color = generateColorsFromID(member);
        }

        cachedPKColors.set(username, color);

        console.log(username + " : " + color);
    }
    else { console.error("Could not Find PK Message"); }

    queuedNames.splice(queuedNames.indexOf[username], 1);
    console.log(queuedNames);
    return
    //updateMessage(channelID,messageID)
}

function adjustColor(color: string, saturation: number = -1, minL: number = settings.store.minLightness, maxL: number = settings.store.maxLightness) {
    var hslColor = hexToHSL(color);

    if (hslColor.lightness < minL) {
        hslColor.lightness = minL;
    }
    else if (hslColor.lightness > maxL) {
        hslColor.lightness = maxL;
    }
    if (saturation > 0) { hslColor.saturation = saturation; }
    color = hslToHex(hslColor.hue, hslColor.saturation, hslColor.lightness);

    return color;
}

function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
    };
    return `${f(0)}${f(8)}${f(4)}`;
}

// what a coincidence that pk member IDs are 6 letters long
function generateColorsFromID(member: pkMember) {
    const id = member.id;
    var color = "";
    for (let i = 0; i < id.length; i++) {
        var c = id.charAt(i);
        const alphabet = "abcdefghijklmnopqrstuvwxyz";
        const hexxabet = "0123456789abcdeffedcba9876";
        c = hexxabet.charAt(alphabet.indexOf(c));

        color.padEnd(6, "f");//just in case
        color += c;
    }
    return adjustColor(color, settings.store.idSaturation);
}

async function updateFrontOnMessage(msg: MessageObject) {
    if (msg.content.startsWith("pk; sw")) {
        await sleep(200);
        updateFrontActivity();
    }
}

async function addTypingQuirk(msg: MessageObject, quirk: TypingQuirk) {
    msg.content = await quirkifyText(msg.content);
}
