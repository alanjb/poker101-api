import dotenv from 'dotenv';

dotenv.config();

export const {
    SERVER_HTTP_PORT: serverPort,
    CLIENT_ORIGIN_URL: client,
    P_USER: dbUser,
    P_PASSWORD: dbPassword,
    P_LOCATION: dbLocation,
} = process.env;

if (!serverPort) {
    throw new Error(
        ".env is missing the definition of a API_PORT environmental variable"
    );
}