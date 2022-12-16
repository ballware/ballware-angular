export const environment = {
    production: false,
    name: 'dev',
    envVar: {
        BALLWARE_BASEURL: 'https://localhost:3000',
        BALLWARE_IDENTITYURL: 'https://identity.ballware.de',
        BALLWARE_METAURL: 'https://meta.ballware.de',
        BALLWARE_DOCUMENTURL: 'https://documents.ballware.de',
        BALLWARE_CLIENTID: 'ballwareweb',
        BALLWARE_CLIENTSECRET: undefined,
        BALLWARE_TENANTCLAIM: 'tenant',
        BALLWARE_USERNAMECLAIM: 'preferred_username',
        BALLWARE_IDENTITYSCOPES: 'openid profile offline_access identityApi documentApi metaApi',
        BALLWARE_ACCOUNTURL: 'https://identity.ballware.de/Manage/Index',
        BALLWARE_GOOGLEKEY: "unlicensed"
    }
}
