require('dotenv').config();

const TOKEN = process.env.TOKEN || process.env.token;
const DISABLE_VOICE = (process.env.DISABLE_VOICE || 'false').toLowerCase() === 'true';

if (!TOKEN) {
    throw new Error('TOKEN ausente. Crie um arquivo .env com base no .env.example antes de iniciar o bot.');
}

module.exports = {
    TOKEN,
    DISABLE_VOICE,
    NODE_ENV: process.env.NODE_ENV || 'development'
};
