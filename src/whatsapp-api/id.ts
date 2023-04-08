// id.ts
// (C) Martin Alebachew, 2023

export enum Server {
    PrivateChat = "@c.us",
    GroupChat = "@g.us"
}

export class Id {
    private _user: string
    private _server: Server
    private _serialized: string

    constructor(user: string, server: Server) {
        this._user = user
        this._server = server
        this._serialized = this._serialize()
    }

    public set user (user: string) {
        this._user = user
        this._serialized = this._serialize()
    }

    public set server (server: Server) {
        this._server = server
        this._serialized = this._serialize()
    }

    private _serialize() {
        return this._user + this._server
    }

    public toString() {
        return this._serialized;
    }
}