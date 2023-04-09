// index.ts
// (C) Martin Alebachew, 2023

import { join, basename } from "path"
import { Command, GroupChatPermissions, PrivateChatPermissions } from "./commands/commands"
import { dirToCategories } from "./commands/categories"
import { log } from "./utils/log"
import { WhatsAppConnection } from "./whatsapp-api/client"
import { MessageBase, TextMessage } from "./whatsapp-api/message"
import { UserAddress} from "./whatsapp-api/address";
import { parsePhoneNumber } from "libphonenumber-js"
import { GroupParticipant } from "@adiwajshing/baileys";


// Phase 0: Load configuration file
let filesystem = require("fs")
let config

if (filesystem.existsSync("../config.json")) {
    log("Loading configuration from config.json...")
    config  = require("../config.json")
} else log("Loading configuration from environment variables...")

const BOT_PREFIX = config?.botPrefix || process.env.BOT_PREFIX  // Prefix for all bot commands
let phoneNumber = parsePhoneNumber(config?.phoneNumber || process.env.PHONE_NUMBER, config?.countryCode || process.env.COUNTRY_CODE)
const OWNER_ADDRESS = new UserAddress(parseInt(phoneNumber.countryCallingCode + phoneNumber.nationalNumber))  // Bot owner's address


// Phase 1: Load commands
// Load command files and extract commands
log("Loading command files...")

export let commandsDict: { [key: string]: Command } = { }
export let commandsByCategories: { [key: string]: Command[] } = { }
;(function scanForCommandFiles(fullDir: string) {
    let filesystem = require("fs")
    filesystem.readdirSync(fullDir).forEach((filename: string) => {
        // For every file and directory under the commands directory:
        if (!filename.endsWith("commands.js") && !filename.endsWith("categories.js")) {  // Both files are NOT commands
            let file = fullDir + '/' + filename  // Get full path
            if (filesystem.statSync(file).isDirectory())
                scanForCommandFiles(file)
                // TODO: limit to one level only
            else {
                let command = require(file)
                log("* Loaded " + file)
                commandsDict[command.nativeText.name] = command

                let category = dirToCategories[basename(fullDir)]
                if (!category) throw Error(`No matching category for directory: ${basename(fullDir)}`)
                if (!commandsByCategories[category])
                    commandsByCategories[category] = []
                commandsByCategories[category].push(command)
            }
        }
    });
})(join(__dirname, "commands"))  // Project's sub-directory for command files
log("Loaded command.")

// Phase 2: Connect to WhatsApp
const whatsapp = new WhatsAppConnection()
whatsapp.authenticate().then(() => { whatsapp.setCallback(messageCallback) })

async function messageCallback(message: TextMessage, type: string ) {
    /* Pre-processing: This function is called only on messages
    of a supported type and have been sent while the bot is online. */

    // Processing Stage 1: Obtain command
    let content = message.text
    if (!content.startsWith(BOT_PREFIX)) return

    let args = content.substring(BOT_PREFIX.length).split(" ")
    let commandKey = args.shift()
    if (!commandKey) return

    let commandObj = commandsDict[commandKey]
    if (!commandObj) return

    // Processing Stage 2: Check message type
    if (!commandObj.requestTypes.includes(type)) return

    // Processing Stage 3: Verify permissions
    if (!message.inGroup) {  // Private chat
        let senderPerms = (message.author.equals(OWNER_ADDRESS)) ? PrivateChatPermissions.Owner : PrivateChatPermissions.Everyone
        if (commandObj.permissions.privateChat < senderPerms) return
    } else {  // Group chat
        let senderPerms
        if (message.author.equals(OWNER_ADDRESS)) senderPerms = GroupChatPermissions.Owner
        else {
            let groupMetadata = await whatsapp.fetchGroupMetadata(message.chat)
            let participant = groupMetadata.participants.find((participant: GroupParticipant) => {
                return participant.id === message.author.serialized
            })

            let isAdmin = participant.isAdmin || participant.isSuperAdmin
            senderPerms = isAdmin ? GroupChatPermissions.Admin : GroupChatPermissions.Everyone
        }

        if (commandObj.permissions.groupChat < senderPerms) return
    }

    // Processing Stage 4: Execute command
    log("---> Executing command", commandObj.nativeText.name, "from", message.author.serialized)
    await commandObj.execute(whatsapp, message, type, args)
}
