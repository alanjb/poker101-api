import App from './src/app/App';
import http from 'http';
import { serverPort } from './src/app/config/env.dev';

//start server
const app = App.buildApp();

if (!app) {
    throw new Error(
        "Error: Couldn't load app..."
    );
}

const server = http.createServer(app);

if (!server) {
    throw new Error(
        "Error: Couldn't load server..."
    );
}

//now listening for client requests 
server.listen(serverPort);

server.on('listening', () => {
    const addr = server.address();
    const bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;

    console.log('Listening on ' + bind + '...');
});