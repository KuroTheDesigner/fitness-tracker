export default {
    providers: [
        {
            type: "customJwt",
            issuer: "https://shoo.dev",
            jwks: "data:text/plain;charset=utf-8;base64,eyJrZXlzIjpbeyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6IndKSG9QTmxPaVZfakxJX3NFSFZQLW9OMm1rLVdVb25lWloyLTZJREdIazAiLCJ5IjoiNzRVdHZYRk5SaXc0dk55b0o2VXVVWTZNQW5pb1pRcmZqcTQ0Uy04TVE0ayIsImtpZCI6InNob28tZXMyNTYtMSIsInVzZSI6InNpZyIsImFsZyI6IkVTMjU2In1dfQ==",
            algorithm: "ES256",
        },
    ],
};
