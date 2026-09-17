const path = require('node:path');
const {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
    Client,
    EmbedBuilder,
    GatewayIntentBits
} = require('discord.js');

require('../src/config/env');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const CANAL_ID = 'SEU_ID_CANAL_OFICIALIZAR';
const CAMINHO_BANNER = path.join(__dirname, '..', 'assets', 'banner_ofctime.jpg');

client.once('ready', async () => {
    console.log(`Bot conectado como ${client.user.tag}`);

    try {
        const canal = await client.channels.fetch(CANAL_ID);
        if (!canal) {
            console.error('Canal de oficialização não encontrado.');
            return;
        }

        const banner = new AttachmentBuilder(CAMINHO_BANNER, {
            name: 'banner_ofctime.jpg'
        });
        const embed = new EmbedBuilder()
            .setColor(0xF1C40F)
            .setDescription(
                '# __**OFICIALIZAR TIME**__\n\n' +
                '## • Benefícios\n\n' +
                '- <:etiqueta:SEU_EMOJI_ETIQUETA> Cargo com o nome do time\n' +
                '- <:paint:SEU_EMOJI_PAINT> Cor personalizada\n' +
                '- <:star:SEU_EMOJI_STAR> Reconhecimento no server\n\n' +
                '## • Preços\n' +
                '<:moeda:SEU_EMOJI_MOEDA> 15$ por time\n' +
                '\u200b'
            )
            .setImage('attachment://banner_ofctime.jpg');
        const botao = new ButtonBuilder()
            .setCustomId('oficializar_time')
            .setLabel('Oficializar')
            .setEmoji({ name: 'acept', id: 'SEU_EMOJI_ACEPT' })
            .setStyle(ButtonStyle.Secondary);

        await canal.send({
            embeds: [embed],
            files: [banner],
            components: [new ActionRowBuilder().addComponents(botao)]
        });
        console.log('Mensagem de oficialização enviada com sucesso.');
    } catch (error) {
        console.error('Erro ao enviar a mensagem de oficialização:', error);
    } finally {
        client.destroy();
    }
});

client.login(process.env.TOKEN);
