import App from './src/app/App';
import http from 'http';
import { startWS } from './src/game/utils/utils';
require('dotenv').config();

(async function() {
    try {
        const app = await App.build();

        if(!app) {
            throw new Error('There was a problem building the app')
        }

        const server = http.createServer(app);

        if(!server) {
            throw new Error('There was a problem building the server')
        }

        startWS(server);

        server.listen(process.env.API_PORT);
        server.on('listening', () => {
            const addr = server.address();
            const bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;

            console.log('Listening on ' + bind + '...');
        });
    }
    catch (error) {
        console.log("Error: " + error.message);
    }
})();