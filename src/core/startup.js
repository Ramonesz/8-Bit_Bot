const { TOKEN } = require('../config/env');
const logger = require('./logger');

async function startBot(client) {
    try {
        await client.login(TOKEN);
    } catch (error) {
        logger.error('Falha ao conectar o bot.', error);
        process.exit(1);
        return;
    }

    logger.info('Bot inicializado com sucesso.');
}

module.exports = {
    startBot
};
