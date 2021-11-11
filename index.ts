import App from './src/app/App';
import dotenv from 'dotenv';
import https from 'https';
import http from 'http';
import fs from 'fs';

//access to environment variables
dotenv.config();

//prod env port
const HTTPS_PORT = process.env.HTTPS_PORT;

//dev env port
const HTTP_PORT = process.env.HTTP_PORT;

//env type
const ENVIRONMENT = process.env.ENVIRONMENT;

//start application
const app = App.buildApp();

//only create server and controller once app has been built
if (app) {
    let server = null;

    if (ENVIRONMENT === 'DEV') {
        console.log('Creating HTTP server for DEV...');

        server = http.createServer(app);
    } else if(ENVIRONMENT === 'PROD') {
        console.log('Creating HTTPS server for PROD...');
    }

    if (server) {

        //now listening for client requests 
        server.listen(process.env.ENVIRONMENT === 'DEV' ? HTTP_PORT : HTTPS_PORT);
    
        server.on('listening', () => {
            const addr = server.address();
            const bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
    
            console.log('Listening on ' + bind + '...');
        });

    } else {
        console.log('ERROR loading server. Please reload...');
    }
} else {
    console.log('ERROR loading app. Please reload...');
}