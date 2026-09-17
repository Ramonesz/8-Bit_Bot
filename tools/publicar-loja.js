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

const EMOJI_GEMA = '<:gema:SEU_EMOJI_GEMA>';
const CARGOS_LOJA = [
    {
        nome: 'Blessed', id: 'SEU_ID_CARGO_BLESSED', emoji: '🪽', preco: '$20', precoGemas: 200000,
        beneficios: [
            '🎨 1x cargo personalizado',
            '🔒 Acesso ao VIP geral'
        ]
    },
    {
        nome: 'Hydra', id: 'SEU_ID_CARGO_HYDRA', emoji: '🐉', preco: '$30', precoGemas: 300000,
        beneficios: [
            '🎨 1x cargo personalizado',
            '🔊 1x call personalizada',
            '🔒 Acesso ao VIP geral'
        ]
    },
    {
        nome: 'Skull', id: 'SEU_ID_CARGO_SKULL', emoji: '💀', preco: '$40', precoGemas: 400000,
        beneficios: [
            '🎨 2x cargo personalizado',
            '🔊 1x call personalizada',
            '🔒 Acesso ao VIP geral',
            '🔇 VMute: 1x de 1 hora'
        ]
    },
    {
        nome: 'Demon', id: 'SEU_ID_CARGO_DEMON', emoji: '😈', preco: '$50', precoGemas: 500000,
        beneficios: [
            '🎨 3x cargo personalizado',
            '🔊 1x call personalizada',
            '🔒 Acesso ao VIP geral e ao VIP privado',
            '🔇 VMute: 1x de 1 dia ou 2x de 1 hora'
        ]
    },
    {
        nome: 'God', id: 'SEU_ID_CARGO_GOD', emoji: '👑', preco: '$60', precoGemas: 600000,
        beneficios: [
            '🎨 4x cargo personalizado',
            '🔊 1x call personalizada',
            '🔒 Acesso ao VIP geral e ao VIP privado',
            '🔇 VMute: 2x de 2 dias ou 3x de 1 hora'
        ]
    }
];

const CANAL_LOJA_ID = 'SEU_ID_CANAL_LOJA';

function montarDescricaoLojaCargos() {
    const blocos = [...CARGOS_LOJA].reverse().map(cargo => {
        const linhasBeneficios = cargo.beneficios.map(linha => `* ${linha}`).join('\n');
        const precoGemas = cargo.precoGemas.toLocaleString('pt-BR');
        return `### <@&${cargo.id}>\n**Validade:**\n📅 30 dias\n**Preço:**\n${EMOJI_GEMA} ${precoGemas} gemas\n💵 ${cargo.preco}\n**Benefícios:**\n${linhasBeneficios}`;
    });

    return `# 🛒 LOJA DE CARGOS
💰 **Adquira um cargo exclusivo e desbloqueie benefícios dentro do servidor!**

Quanto maior o cargo, maiores serão os benefícios.

${blocos.join('\n\n')}

💎 **Escolha seu cargo e aproveite seus benefícios!**`;
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log(`Bot conectado como ${client.user.tag}`);

    try {
        const canal = await client.channels.fetch(CANAL_LOJA_ID);
        if (!canal) {
            console.error('Canal de loja não encontrado.');
            process.exit(1);
        }

        const embed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setDescription(montarDescricaoLojaCargos());

        const botaoPrecos = new ButtonBuilder()
            .setCustomId('loja_precos')
            .setLabel('Ver Preços')
            .setEmoji({ name: 'moeda', id: 'SEU_EMOJI_MOEDA' })
            .setStyle(ButtonStyle.Secondary);

        const botaoComprar = new ButtonBuilder()
            .setCustomId('loja_comprar')
            .setLabel('Comprar')
            .setEmoji({ name: 'acept', id: 'SEU_EMOJI_ACEPT' })
            .setStyle(ButtonStyle.Success);

        await canal.send({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(botaoPrecos, botaoComprar)]
        });

        console.log('✅ Mensagem da loja enviada com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao enviar a mensagem da loja:', error.message);
        process.exit(1);
    } finally {
        client.destroy();
    }
});
