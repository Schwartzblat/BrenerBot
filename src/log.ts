// log.ts
// (C) Martin Alebachew, 2023

export function log(...args: any[]) {
    args.forEach(arg => {
        console.log(arg)
    })
}