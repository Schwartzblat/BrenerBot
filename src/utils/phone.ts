// phone.ts
// (C) Martin Alebachew, 2023

import { parsePhoneNumber, CountryCode } from 'libphonenumber-js'

const PRIVATE_CHAT_SURFIX = "@c.us"

export function phoneNumberToChat(country: CountryCode, phoneNumber: string) {
    let formattedPhoneNumber = parsePhoneNumber(phoneNumber, country).number
    formattedPhoneNumber = formattedPhoneNumber.substring(1, formattedPhoneNumber.length)  // Remove '+' prefix
    return formattedPhoneNumber + PRIVATE_CHAT_SURFIX
}

export function chatToPhoneNumber(chatId: string) {
    if (!chatId.endsWith(PRIVATE_CHAT_SURFIX)) throw Error("Bad chatId: no indication of private chat.")
    return chatId.substring(0, chatId.length - PRIVATE_CHAT_SURFIX.length)
}