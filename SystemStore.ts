import { createStore } from "@api/DataStore";

import { Member, Message, ProxyTag, Switch, System, SystemAutoproxySettings, SystemFetchOptions } from "pkapi.js";
import { settings, Native } from ".";
import { GuildStore, UserStore } from "@webpack/common";
import { populateQuirks, quirkMap } from "./quirks";

export var storedSystem: System;
export var membersByProxy = new Map();
export var proxiesByMember = new Map();
export var currentAutoProxy: SystemAutoproxySettings;

export async function getSystemData() {
    storedSystem = await Native.pkSystemRequest(UserStore.getCurrentUser().id, settings.store.pkToken/*, ["fronters" /*, "members"]*/);
    storedSystem.members?.forEach(
        (m, k) => {
            m.proxy_tags?.forEach(
                (t, p) => {
                    const proxyString = (t.prefix + "text" + t.suffix).trim().replaceAll("null", "");
                    quirkMap.set(proxyString, "");
                    membersByProxy.set(proxyString, m);
                    proxiesByMember.set(m.id, proxyString);
                }
            );
        }
    );
    populateQuirks();
    console.log(membersByProxy);
    console.log(proxiesByMember);
}
