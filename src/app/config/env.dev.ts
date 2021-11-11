import dotenv from 'dotenv';

dotenv.config();

export const {
    AUTH0_AUDIENCE_DEV: audience,
    AUTH0_DOMAIN: domain,
    SERVER_HTTP_PORT: serverPort,
    CLIENT_ORIGIN_URL: client,
    P_USER: dbUser,
    P_PASSWORD: dbPassword,
    P_LOCATION: dbLocation,
} = process.env;

if (!audience) {
    throw new Error(
        ".env is missing the definition of an AUTH0_AUDIENCE environmental variable"
    );
}

if (!domain) {
    throw new Error(
        ".env is missing the definition of an AUTH0_DOMAIN environmental variable"
    );
}

if (!serverPort) {
    throw new Error(
        ".env is missing the definition of a API_PORT environmental variable"
    );
}