// main.ts
// (C) Martin Alebachew, 2023

import { join, basename } from "path"
import { Command, GroupChatPermissions, PrivateChatPermissions } from "./commands/commands"
import { dirToCategories } from "./commands/categories"
import { GROUP_CHAT_SUFFIX, PRIVATE_CHAT_SUFFIX, phoneNumberToChat } from "./utils/phone";
import { log } from "./log"
import { GroupChat, Message, MessageTypes } from 'whatsapp-web.js'
const { Client, LocalAuth } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')


// Phase 0: Load configuration file
let filesystem = require("fs")
let config

if (filesystem.existsSync("../config.json")) {
    log("Loading configuration from config.json...")
    config  = require("../config.json")
} else log("Loading configuration from environment variables...")

const BOT_PREFIX = config?.botPrefix || process.env.BOT_PREFIX  // Prefix for all bot commands
const OWNER_SERIALIZED = phoneNumberToChat(  // Bot's owner phone number
    config?.countryCode || process.env.COUNTRY_CODE,
    config?.phoneNumber || process.env.PHONE_NUMBER
)


// Phase 1: Load commands
// Load command files and extract commands
log("Loading command files...")

export let commandsDict: { [key: string]: Command } = { }
export let commandsByCategories: { [key: string]: Command[] } = { }
;(function scanForCommandFiles(fullDir: string) {
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


// Phase 2: Connect to WhatsApp
const WhatsAppClient = new Client({
    authStrategy: new LocalAuth(),  // Try to restore last session
    puppeteer: { handleSIGINT: false }  // Required for auth persistence
})

WhatsAppClient.on('qr', (qr: string) => {
    qrcode.generate(qr, { small: true });
});

WhatsAppClient.on('ready', () => {
    log('\nConnected to WhatsApp.');
});

WhatsAppClient.on('message', async (msg: Message) => {
    // Processing Stage 1: Obtain command
    let content = msg.body
    if (!content.startsWith(BOT_PREFIX)) return

    let args = content.substring(BOT_PREFIX.length).split(" ")
    let prompt = args.shift()
    if (!prompt) return

    let command = commandsDict[prompt]
    if (!command) return

    // Processing Stage 2: Check message type
    if (command.requestTypes) {
        if (!command.requestTypes.includes(msg.type)) return
    }
    else {
        if (msg.type !== MessageTypes.TEXT) return
    }

    // Processing Stage 3: Verify permissions
    if (msg.from.endsWith(PRIVATE_CHAT_SUFFIX)) {  // Private chat
        let senderPerms = (msg.from === OWNER_SERIALIZED) ? PrivateChatPermissions.Owner : PrivateChatPermissions.Everyone
        if (command.permissions.privateChat < senderPerms) return
    } else if (msg.from.endsWith(GROUP_CHAT_SUFFIX)) {  // Group chat
        let senderPerms
        if (msg.author === OWNER_SERIALIZED) senderPerms = GroupChatPermissions.Owner
        else {
            let isAdmin = false
            ;(await msg.getChat() as GroupChat).participants.every((participant) => {
                if (participant.id._serialized === msg.author) {
                    isAdmin = participant.isAdmin
                } else return true  // Continue iterating through participants
            })

            senderPerms = isAdmin ? GroupChatPermissions.Admin : GroupChatPermissions.Everyone
        }

        if (command.permissions.groupChat < senderPerms) return
    } else return

    // Processing Stage 4: Execute command
    log("---> Executing command", command.nativeText.name, "from", msg.author ?? msg.from)
    await command.execute(WhatsAppClient, msg, args)
})

export async function cleanShutdown() {  // Required for auth persistence
    console.log('\nTerminating...');
    await WhatsAppClient.destroy();
    console.log('Closed WhatsApp connection.');
    process.exit(0);
}

process.on('SIGINT', cleanShutdown);   // CTRL+C
process.on('SIGQUIT', cleanShutdown);  // Keyboard quit
process.on('SIGTERM', cleanShutdown);  // `kill` command

WhatsAppClient.initialize();
