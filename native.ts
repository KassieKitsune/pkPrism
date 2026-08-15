/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { IpcMainInvokeEvent } from "electron";
import PKAPI from "pkapi.js";

const api = new PKAPI();

export async function pkMessageRequest(_: IpcMainInvokeEvent, messageID: string) {
    const message = await api.getMessage({ message: messageID });
    return message;
}

export async function pkSystemRequest(_: IpcMainInvokeEvent, systemID: string, token?: string, fetch?: string[]) {
    const system = await api.getSystem({ system: systemID, token: token, fetch: fetch });
    return system;
}
export async function pkFrontersRequest(_: IpcMainInvokeEvent, systemID: string, token?: string) {
    const fronters = await api.getFronters({ system: systemID, token: token });
    return fronters;
}

export async function pkMemberRequest(_: IpcMainInvokeEvent, memberID: string) {
    const member = await api.getMember({ member: memberID });
    return member;
}
