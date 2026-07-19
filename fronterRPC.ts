import { Activity, ActivityAssets, ActivityButton, Message } from "@vencord/discord-types";
import { ActivityFlags, ActivityStatusDisplayType, ActivityType } from "@vencord/discord-types/enums";
import { ApplicationAssetUtils, AuthenticationStore, FluxDispatcher, PresenceStore, UserStore } from "@webpack/common";


import { Member, Member as pkMember, Switch, System } from "pkapi.js";
import { settings, Native } from "."
import { getSystemData, storedSystem } from "./SystemStore";

const PLURALKIT_BOT_ID = "466378653216014359"

async function getApplicationAsset(key: string): Promise<string> {
    return (await ApplicationAssetUtils.fetchAssetIds(PLURALKIT_BOT_ID, [key]))[0];
}

const fronterAssets:ActivityAssets={
    large_image: "",
    large_text: "View on Dashboard",
    large_url: "",
}
const fronterAssetsCovert:ActivityAssets={
    large_image: ""
}
const frontActivity :Activity = {
    type: ActivityType.PLAYING,
    flags: ActivityFlags.INSTANCE,

    application_id: PLURALKIT_BOT_ID,
    name: "",
    assets: fronterAssets,
    details:"via pkPrism",
    state_url:"https://github.com/KassieKitsune/pkPrism",
    state:"system",
    timestamps:{start:0}
}

const frontActivityCovert :Activity = {
    type: ActivityType.PLAYING,
    flags: ActivityFlags.INSTANCE,

    application_id: PLURALKIT_BOT_ID,
    name: "I ♥️",
    assets: fronterAssetsCovert
}

async function setActivity(activity: Activity | null) {
    FluxDispatcher.dispatch({
        type: "LOCAL_ACTIVITY_UPDATE",
        activity,
        socketId: "pkPrism",
    });
}

export async function updateFrontActivity(systemID:string=UserStore.getCurrentUser().id,token:string = settings.store.pkToken){
    console.log("a")
    await getSystemData()
    const sys :System = storedSystem
    const sw :Switch | undefined = storedSystem.fronters
    const m :pkMember | undefined | string = sw?.members?.values().next().value;

    //console.log(sys)
    console.log(sw)
    //console.log(m)

    if (m === undefined){
        setActivity(null);
        return
    }

    switch(settings.store.frontingPresence){
        case "RPCoff":
            setActivity(null)
            break;
        case "RPCstandard":
            setActivity(await createActivity(m,sys,sw?.timestamp))
            break;
        case "RPCcovert":
            setActivity(await createCovertAct(m))
            break;
        case "RPCcustom":
            setActivity(await createCustomAct(m,sys,sw?.timestamp))
            break;
    };
}

async function createCovertAct(m:pkMember){
    fronterAssetsCovert.large_image = await getApplicationAsset(m.avatar_url)
    frontActivityCovert.name = "I ♥️ "+ m.name
    if (settings.store.presenceDisplayName && m.display_name !== "" && m.display_name !== undefined && m.display_name !== null){
        frontActivityCovert.name = "I ♥️ " + m.display_name}
    return structuredClone(frontActivityCovert)
}
async function createActivity(m:pkMember,sys:System,time:string){
    frontActivity.name = m?.name
    if (settings.store.presenceDisplayName && m.display_name !== "" && m.display_name !== undefined && m.display_name !== null){
        frontActivity.name = m?.display_name;
    }
    frontActivity.details = sys?.name;

    frontActivity.timestamps.start = Date.parse(time)

    frontActivity.state = "Via pkPrism";
    if (settings.store.showPronounsInRichPresence){frontActivity.name = frontActivity.name+"("+m?.pronouns +")"};
    frontActivity.details_url = "https://dash.pluralkit.me/profile/s/"+sys?.id;
    fronterAssets.large_image = await getApplicationAsset(m.avatar_url);
    fronterAssets.large_url = "https://dash.pluralkit.me/profile/m/"+m?.id;
    return structuredClone(frontActivity)
}
async function createCustomAct(m:pkMember,sys:System,time:string){
    frontActivity.name = replacePresenceString(settings.store.presenceName,m,sys)
    frontActivity.details = replacePresenceString(settings.store.presenceDetail,m,sys)
    frontActivity.details_url = replacePresenceString(settings.store.presenceDetailLink,m,sys)
    frontActivity.state  = replacePresenceString(settings.store.presenceState,m,sys)
    frontActivity.state_url = replacePresenceString(settings.store.presenceStateLink,m,sys)
    fronterAssets.large_image = await getApplicationAsset(m.avatar_url)
    fronterAssets.large_url = replacePresenceString(settings.store.presenceImageLink,m,sys)
    frontActivity.timestamps.start = Date.parse(time)
    return structuredClone(frontActivity)
}

function replacePresenceString(str:string,m:Member,sys:System){
    return str.replaceAll(
        "[system_name]",sys.name).replaceAll(
            "[name]",m.name).replaceAll(
                "[display_name]",m.display_name).replaceAll(
                    "[pronouns]",m.pronouns).replaceAll(
                        "[system_id]",sys.id).replaceAll(
                            "[member_id]",m.id)
}
