// phone.ts
// (C) Martin Alebachew, 2023

import { parsePhoneNumber, CountryCode } from "libphonenumber-js"
import { Server } from "../whatsapp-api/address"

export function phoneNumberToChat(country: CountryCode, phoneNumber: string) {
    let formattedPhoneNumber = parsePhoneNumber(phoneNumber, country).number
    formattedPhoneNumber = formattedPhoneNumber.substring(1, formattedPhoneNumber.length)  // Remove '+' prefix
    return formattedPhoneNumber + Server.User
}

export function chatToPhoneNumber(chatId: string) {
    if (!chatId.endsWith(Server.User)) throw Error("Bad chat address: no indication of private chat.")
    return chatId.substring(0, chatId.length - Server.User.length)
}