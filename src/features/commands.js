const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Apaga uma quantidade de mensagens do canal')
        .addIntegerOption(option =>
            option
                .setName('quantidade')
                .setDescription('Quantidade de mensagens para apagar (2 a 100)')
                .setRequired(true)
                .setMinValue(2)
                .setMaxValue(100)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    new SlashCommandBuilder()
        .setName('ofctime')
        .setDescription('Atualiza o placar de inscritos (Solo/Equipe) na mensagem do campeonato')
        .addStringOption(option =>
            option
                .setName('tipo')
                .setDescription('Qual placar atualizar')
                .setRequired(true)
                .addChoices(
                    { name: 'Solo', value: 'solo' },
                    { name: 'Equipe', value: 'equipe' }
                )
        )
        .addIntegerOption(option =>
            option
                .setName('quantidade')
                .setDescription('Quantos inscritos tem no total agora (substitui o número atual, não soma)')
                .setRequired(true)
                .setMinValue(0)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Aplica um castigo temporário a um usuário')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuário que receberá o castigo')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('tempo')
                .setDescription('Duração em minutos (máximo de 28 dias)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(40320)
        )
        .addStringOption(option =>
            option
                .setName('motivo')
                .setDescription('Motivo do castigo')
                .setRequired(true)
                .setMaxLength(500)
        )
        .setDefaultMemberPermissions(null),
    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bane um usuário do servidor')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuário que será banido')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('motivo')
                .setDescription('Motivo do banimento')
                .setRequired(true)
                .setMaxLength(500)
        )
        .setDefaultMemberPermissions(null),
    new SlashCommandBuilder()
        .setName('perfil')
        .setDescription('Mostra as informações e estatísticas de um usuário')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuário para consultar (opcional)')
                .setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName('status')
        .setDescription('Mostra as estatísticas totais de atividade do servidor')
        .setDMPermission(true),
    new SlashCommandBuilder()
        .setName('rec')
        .setDescription('Aprova um usuário para a equipe Staff')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuário aprovado para a Staff')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(null),
    new SlashCommandBuilder()
        .setName('bau')
        .setDescription('Abre o baú da Penny e ganha gemas'),
    new SlashCommandBuilder()
        .setName('give')
        .setDescription('Dá gemas para um usuário')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuário que receberá as gemas')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('quantidade')
                .setDescription('Quantidade de gemas')
                .setRequired(true)
                .setMinValue(1)
        )
        .setDefaultMemberPermissions(null),
    new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove gemas de um usuário')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuário que terá as gemas removidas')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('quantidade')
                .setDescription('Quantidade de gemas a remover')
                .setRequired(true)
                .setMinValue(1)
        )
        .setDefaultMemberPermissions(null),
    new SlashCommandBuilder()
        .setName('set')
        .setDescription('Define um cargo da loja para um usuário por 30 dias (ou tempo customizado)')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuário que receberá o cargo')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('cargo')
                .setDescription('Cargo da loja que será definido')
                .setRequired(true)
                .addChoices(
                    { name: 'Blessed', value: 'SEU_ID_DISCORD' },
                    { name: 'Hydra', value: 'SEU_ID_DISCORD' },
                    { name: 'Skull', value: 'SEU_ID_DISCORD' },
                    { name: 'Demon', value: 'SEU_ID_DISCORD' },
                    { name: 'God', value: 'SEU_ID_DISCORD' }
                )
        )
        .addStringOption(option =>
            option
                .setName('tempo')
                .setDescription('Tempo customizado (ex: 7d, 12h, 30m). Se não informar, usa 30 dias')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(null),
    new SlashCommandBuilder()
        .setName('cargovip')
        .setDescription('Mostra seus cargos da loja e os benefícios restantes'),
    new SlashCommandBuilder()
        .setName('editarcall')
        .setDescription('Altera o nome da call temporária em que você está'),
    new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Compra um cargo por 30 dias usando gemas')
        .addStringOption(option =>
            option
                .setName('cargo')
                .setDescription('Cargo que você deseja comprar')
                .setRequired(true)
                .addChoices(
                    { name: 'Blessed', value: 'SEU_ID_DISCORD' },
                    { name: 'Hydra', value: 'SEU_ID_DISCORD' },
                    { name: 'Skull', value: 'SEU_ID_DISCORD' },
                    { name: 'Demon', value: 'SEU_ID_DISCORD' },
                    { name: 'God', value: 'SEU_ID_DISCORD' }
                )
        )
        .setDMPermission(true),
    new SlashCommandBuilder()
        .setName('horas')
        .setDescription('Mostra as horas de call de um usuário')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuário para consultar (opcional)')
                .setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName('msg')
        .setDescription('Mostra o total de mensagens de um usuário')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuário para consultar (opcional)')
                .setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName('top')
        .setDescription('Mostra um ranking do servidor')
        .addStringOption(option =>
            option
                .setName('tipo')
                .setDescription('Tipo de ranking')
                .setRequired(true)
                .addChoices(
                    { name: 'Gemas', value: 'gemas' },
                    { name: 'Horas de call', value: 'horas' },
                    { name: 'Mensagens', value: 'mensagens' }
                )
        ),
    new SlashCommandBuilder()
        .setName('doar')
        .setDescription('Doa gemas para outro usuário')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuário que receberá as gemas')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('quantidade')
                .setDescription('Quantidade de gemas para doar')
                .setRequired(true)
                .setMinValue(1)
        ),
    new SlashCommandBuilder()
        .setName('gema')
        .setDescription('Mostra seu saldo de gemas')
];

module.exports = {
    commands
};
