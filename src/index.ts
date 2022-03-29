import config from './config';
import Server from './express/server';
import logger from './utils/logger';

const { service } = config;

const main = async () => {
    const server = new Server(service.port);

    await server.start();

    logger.log('info', `Server started on port: ${service.port}`);
};

main().catch((err) => logger.log('error', err));
