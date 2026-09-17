require('../config/env');

const fs = require('node:fs');
const { joinVoiceChannel } = require('@discordjs/voice');
const { DISABLE_VOICE } = require('../config/env');
const client = require('./client');

const USAR_EVENTOS_MODULARES = false;

process.on('unhandledRejection', (reason) => {
    const mensagem = reason instanceof Error ? reason.message : String(reason);
    if (mensagem.includes('Cannot perform IP discovery - socket closed')) {
        console.warn('[voz] Ignorando falha de rede do Discord Voice (socket fechado). O bot continuará funcionando sem voz.');
        return;
    }

    console.error('Unhandled rejection:', reason);
});

const {
    AttachmentBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ChannelType,
    MessageType,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    MessageFlags,
    AuditLogEvent,
    PermissionFlagsBits
} = require('discord.js');

const {
    ROOT,
    CAMINHO_ESTADO_PERFIS,
    CAMINHO_ESTADO_CARGOS_VIP,
    CAMINHO_RASTREAMENTO_CARGOS_VIP,
    CAMINHO_ESTADO_CAMPEONATO,
    CAMINHO_BANNER_CAMPEONATO,
    CAMINHO_GIF_BAU,
    CARGO_NOVO_MEMBRO_ID,
    CARGO_STAFF_ID,
    CARGO_OWNER_ID,
    CARGO_SUB_OWNER_ID,
    CARGO_MARCAR_PUNICOES_ID,
    CARGO_ATENDIMENTO_ID,
    CARGO_BOOSTER_ID,
    CARGO_PING_PARCERIA_ID,
    CARGO_PING_CALL_ID,
    CARGO_PING_PARCERIAS_NOTIF_ID,
    CANAL_BOAS_VINDAS_ID,
    CANAL_CHAT_NOVO_MEMBRO_ID,
    CANAL_REGRAS_ID,
    CANAL_SUPORTE_ID,
    CANAL_CARGOS_ID,
    CANAL_LOJA_ID,
    CANAL_CAMPEONATO_ID,
    CANAL_OFICIALIZAR_ID,
    CANAL_OFICIALIZAR_CLUBE_ID,
    CANAL_BOOSTERS_ID,
    CANAL_ENTRADA_AUTOMATICA_ID,
    CANAL_LOGS_ID,
    CANAL_LOG_CANAIS_ID,
    CANAL_LOG_CARGOS_ID,
    CANAL_LOG_CALLS_ID,
    CANAL_LOG_AUTOMOD_ID,
    CANAL_LOG_PUNICOES_ID,
    CANAL_LOG_TICKETS_ID,
    CANAL_LOG_BANS_ID,
    CANAL_NOTICIAS_STARS_ID,
    CANAL_PARCERIAS_NOTIF_ID,
    CATEGORIA_CALLS_PERSONALIZADAS_ID,
    EMOJI_GEMA,
    EMOJI_1_ID,
    EMOJI_2_ID,
    EMOJI_3_ID,
    EMOJI_BOTAO_COMPRAR_ID,
    EMOJI_BOTAO_SOLO_ID,
    EMOJI_BOTAO_EQUIPE_ID,
    EMOJI_CAMPEONATO_INFO_ID,
    EMOJI_ASSUMIR_TICKET_ID,
    EMOJI_FECHAR_TICKET_ID,
    EMOJI_CARGOS_TROFEUS_ID,
    EMOJI_CARGOS_RANQUEADA_ID,
    EMOJI_CARGOS_INFO_ID,
    EMOJI_CARGOS_PINGS_ID,
    DURACAO_CARGO_COMPRA_MS,
    HORA_EM_MS,
    COOLDOWN_BAU_MS,
    LIMITE_INSCRICOES_SOLO,
    LIMITE_INSCRICOES_EQUIPE,
    LIMITE_CALL_CRIADA,
    CARGOS_AUTORIZADOS_DECISAO_PUNICAO,
    CARGOS_AUTORIZADOS_ASSUMIR_TICKET,
    CARGOS_AUTORIZADOS_REC,
    CARGOS_EQUIPE,
    HUBS_DE_CALL,
    CANAL_PARCERIAS_BANNER_ID,
    CANAL_INFLUENCER_BANNER_ID,
    CANAL_PARCERIAS_ID
} = require('../../config/constantes');

const GEMAS_POR_MARCO_MENSAGENS = 100;
const MENSAGENS_POR_MARCO = 100;
const GEMAS_POR_HORA_CALL = 100;
const COR_EMBED = 0xFF0000;
const COR_BOAS_VINDAS = 0x1ABC9C;
const COR_LOJA = 0xFFA500;
const COR_CAMPEONATO = 0xF1C40F;
const COR_OFICIALIZAR = 0xF1C40F;
const COR_OFICIALIZAR_CLUBE = 0xF1C40F;
const COR_LOG_ENVIADA = 0x2ECC71;
const COR_LOG_EDITADA = 0xF1C40F;
const COR_LOG_APAGADA = 0xE74C3C;
const COR_LOG_CALL_ENTROU = 0x2ECC71;
const COR_LOG_CALL_TROCOU = 0xF1C40F;
const COR_LOG_CALL_SAIU = 0xE74C3C;
const COR_LOG_AUTOMOD = 0xE74C3C;
const COR_PENALIDADE = 0x00E5FF;

const CARGOS_LOJA = [
    {
        nome: 'Blessed', id: 'SEU_ID_CARGO_BLESSED', emoji: '🪽', preco: '$20', precoGemas: 200000,
        beneficios: [
            '🎨 1x cargo personalizado',
            '🔒 Acesso ao VIP geral'
        ],
        limitesBeneficios: { cargosPersonalizados: 1, callsPersonalizadas: 0, vmutes: [] }
    },
    {
        nome: 'Hydra', id: 'SEU_ID_CARGO_HYDRA', emoji: '🐉', preco: '$30', precoGemas: 300000,
        beneficios: [
            '🎨 1x cargo personalizado',
            '🔊 1x call personalizada',
            '🔒 Acesso ao VIP geral'
        ],
        limitesBeneficios: { cargosPersonalizados: 1, callsPersonalizadas: 1, vmutes: [] }
    },
    {
        nome: 'Skull', id: 'SEU_ID_CARGO_SKULL', emoji: '💀', preco: '$40', precoGemas: 400000,
        beneficios: [
            '🎨 2x cargo personalizado',
            '🔊 1x call personalizada',
            '🔒 Acesso ao VIP geral',
            '🔇 VMute: 1x de 1 hora'
        ],
        limitesBeneficios: { cargosPersonalizados: 2, callsPersonalizadas: 1, vmutes: [{ quantidade: 1, duracao: '1 hora' }] }
    },
    {
        nome: 'Demon', id: 'SEU_ID_CARGO_DEMON', emoji: '😈', preco: '$50', precoGemas: 500000,
        beneficios: [
            '🎨 3x cargo personalizado',
            '🔊 1x call personalizada',
            '🔒 Acesso ao VIP geral e ao VIP privado',
            '🔇 VMute: 1x de 1 dia ou 2x de 1 hora'
        ],
        limitesBeneficios: { cargosPersonalizados: 3, callsPersonalizadas: 1, vmutes: [{ quantidade: 1, duracao: '1 dia' }, { quantidade: 2, duracao: '1 hora' }] }
    },
    {
        nome: 'God', id: 'SEU_ID_CARGO_GOD', emoji: '👑', preco: '$60', precoGemas: 600000,
        beneficios: [
            '🎨 4x cargo personalizado',
            '🔊 1x call personalizada',
            '🔒 Acesso ao VIP geral e ao VIP privado',
            '🔇 VMute: 2x de 2 dias ou 3x de 1 hora'
        ],
        limitesBeneficios: { cargosPersonalizados: 4, callsPersonalizadas: 1, vmutes: [{ quantidade: 2, duracao: '2 dias' }, { quantidade: 3, duracao: '1 hora' }] }
    }
];

// Lê o estado salvo do campeonato.
function lerEstadoCampeonato() {
    if (!fs.existsSync(CAMINHO_ESTADO_CAMPEONATO)) return null;
    try {
        return JSON.parse(fs.readFileSync(CAMINHO_ESTADO_CAMPEONATO, 'utf8'));
    } catch (error) {
        console.error('Erro ao ler estado do campeonato:', error);
        return null;
    }
}

// Salva o estado atualizado do campeonato.
function salvarEstadoCampeonato(estado) {
    fs.writeFileSync(CAMINHO_ESTADO_CAMPEONATO, JSON.stringify(estado, null, 2));
}

const limitarCampoEmbed = valor => String(valor).slice(0, 1024);

const CARGOS_ISENTOS_AUTOMOD_IDS = [
    'SEU_ID_CARGO_OWNER',
    'SEU_ID_CARGO_SUB_OWNER',
    'SEU_ID_CARGO_ATENDIMENTO',
    'SEU_ID_CARGO_STAFF'
];

const REGEX_CONVITE_DISCORD = /(discord\.gg|discord(?:app)?\.com\/invite)\/\S+/i;

const LIMITE_SPAM_MENSAGENS = 5;
const JANELA_SPAM_MS = 5000;
const mensagensRecentesPorUsuario = new Map();

const idsApagadosPeloAutoMod = new Set();

const PALAVRAS_BLOQUEADAS = [
    'nazi*', 'nazista*', 'hitler*', 'heil*', 'swastika*', 'suástica*', '1488', '88',
    'white power', 'whitepower', 'aryan*', 'neonazi*', 'neonazista*', 'ku klux',
    'heil hitler', 'sieg heil', 'third reich', 'terceiro reich',
    'epstein*', 'jeffrey epstein', 'epstein island', 'ilha do epstein', 'lolita express',
    'epstein list', 'lista epstein', 'client list epstein',
    'pdiddy*', 'p diddy', 'p. diddy', 'diddy*', 'sean combs', 'puff daddy', 'puffy',
    'freak off*', 'freakoff*', 'diddy party', 'diddy island',
    'necrofilia*', 'necrophilia*', 'zoofilia*', 'zoophilia*', 'bestiality*', 'zoophile*',
    'pedo*', 'pedofilia*', 'pedófilo*', 'child porn*', 'cp*', 'csam*', 'gore*', 'snuff*',
    'tubgirl*', 'rule34*', 'rule 34',
    'buceta*', 'boquete*', 'gozar*', 'gozando*', 'piroca*', 'punheta*', 'xota*', 'xoxota*',
    'xereca*', 'mama*', 'siririca*', 'tesão*', 'tesuda*', 'tesudo*', 'pau*', 'pênis*',
    'rola*', 'sexo*', 'porn*', 'hentai*', 'onlyfans*', 'ofans*', 'gf*', 'xcam*', 'kelloy*'
];

// Normaliza texto para o auto-mod comparar termos.
function normalizarTexto(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Cria a expressão regular dos termos bloqueados.
function construirRegexPalavrasBloqueadas(lista) {
    const partes = lista.map(termo => {
        const temWildcard = termo.includes('*');
        const baseNormalizada = normalizarTexto(termo.replace(/\*/g, ''));
        const escapado = baseNormalizada.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return temWildcard ? `\\b${escapado}\\w*` : `\\b${escapado}\\b`;
    });
    return new RegExp(partes.join('|'), 'i');
}

const REGEX_PALAVRAS_BLOQUEADAS = construirRegexPalavrasBloqueadas(PALAVRAS_BLOQUEADAS);

// Cargos
const COR_CARGOS = 0x9B59B6;

const GRUPO_TROFEUS = [
    { label: '100K+ Troféus', emoji: '🏆', id: 'SEU_ID_TROFEUS_100K' },
    { label: '90-100K Troféus', emoji: '🏆', id: 'SEU_ID_TROFEUS_90_100K' },
    { label: '80-90K Troféus', emoji: '🏆', id: 'SEU_ID_TROFEUS_80_90K' },
    { label: '70-80K Troféus', emoji: '🏆', id: 'SEU_ID_TROFEUS_70_80K' },
    { label: '60-70K Troféus', emoji: '🏆', id: 'SEU_ID_TROFEUS_60_70K' },
    { label: '50-60K Troféus', emoji: '🏆', id: 'SEU_ID_TROFEUS_50_60K' },
    { label: '40-50K Troféus', emoji: '🏆', id: 'SEU_ID_TROFEUS_40_50K' },
    { label: '30-40K Troféus', emoji: '🏆', id: 'SEU_ID_TROFEUS_30_40K' },
    { label: '20-30K Troféus', emoji: '🏆', id: 'SEU_ID_TROFEUS_20_30K' },
    { label: '10-20K Troféus', emoji: '🏆', id: 'SEU_ID_TROFEUS_10_20K' },
    { label: '0-10K Troféus', emoji: '🏆', id: 'SEU_ID_TROFEUS_0_10K' }
];

const GRUPO_RANQUEADA = [
    { label: 'Pro', emoji: '🦎', id: 'SEU_ID_RANQUEADA_PRO' },
    { label: 'Mestre', emoji: '🏆', id: 'SEU_ID_RANQUEADA_MESTRE' },
    { label: 'Lendário', emoji: '🔴', id: 'SEU_ID_RANQUEADA_LENDARIO' },
    { label: 'Mítico', emoji: '🔮', id: 'SEU_ID_RANQUEADA_MITICO' },
    { label: 'Diamante', emoji: '💎', id: 'SEU_ID_RANQUEADA_DIAMANTE' },
    { label: 'Ouro', emoji: '🥇', id: 'SEU_ID_RANQUEADA_OURO' },
    { label: 'Prata', emoji: '🥈', id: 'SEU_ID_RANQUEADA_PRATA' },
    { label: 'Bronze', emoji: '🥉', id: 'SEU_ID_RANQUEADA_BRONZE' }
];

const GRUPO_GENERO = [
    { label: 'Homem', emoji: '♂️', id: 'SEU_ID_GENERO_HOMEM' },
    { label: 'Mulher', emoji: '♀️', id: 'SEU_ID_GENERO_MULHER' },
    { label: 'Não-Binário', emoji: '🧘', id: 'SEU_ID_GENERO_NAO_BINARIO' },
    { label: 'Outro', emoji: '⚧️', id: 'SEU_ID_GENERO_OUTRO' }
];

const GRUPO_IDADE = [
    { label: '12-', emoji: '🍼', id: 'SEU_ID_IDADE_12' },
    { label: '13–14', emoji: '🍭', id: 'SEU_ID_IDADE_13_14' },
    { label: '15–17', emoji: '🎸', id: 'SEU_ID_IDADE_15_17' },
    { label: '18+', emoji: '🍺', id: 'SEU_ID_IDADE_18' }
];

const GRUPO_REGIAO = [
    { label: 'Norte', emoji: '🦜', id: 'SEU_ID_REGIAO_NORTE' },
    { label: 'Nordeste', emoji: '🌵', id: 'SEU_ID_REGIAO_NORDESTE' },
    { label: 'Centro-Oeste', emoji: '🌾', id: 'SEU_ID_REGIAO_CENTRO_OESTE' },
    { label: 'Sudeste', emoji: '🏢', id: 'SEU_ID_REGIAO_SUDESTE' },
    { label: 'Sul', emoji: '🧉', id: 'SEU_ID_REGIAO_SUL' }
];

const GRUPO_PINGS = [
    { label: 'Push Troféus', emoji: '🏆', id: 'SEU_ID_PING_PUSH_TROFEUS' },
    { label: 'Push Ranqueada', emoji: '🎯', id: 'SEU_ID_PING_PUSH_RANQUEADA' },
    { label: 'Sem Clube', emoji: '🛡️', id: 'SEU_ID_PING_SEM_CLUBE' },
    { label: 'Ping • Call', emoji: '📢', id: 'SEU_ID_PING_CALL' },
    { label: 'Ping • Eventos', emoji: '🎪', id: 'SEU_ID_PING_EVENTOS' },
    { label: 'Ping • Parcerias', emoji: '🤝', id: 'SEU_ID_PING_PARCERIAS' }
];

const CONFIG_CATEGORIAS_CARGOS = {
    trofeus: { grupo: GRUPO_TROFEUS, exclusivo: true, nome: 'Troféus', emojiCabecalhoId: EMOJI_CARGOS_TROFEUS_ID, instrucao: 'Escolha sua faixa de troféus abaixo:' },
    ranqueada: { grupo: GRUPO_RANQUEADA, exclusivo: true, nome: 'Ranqueada', emojiCabecalhoId: EMOJI_CARGOS_RANQUEADA_ID, instrucao: 'Escolha sua liga abaixo:' },
    genero: { grupo: GRUPO_GENERO, exclusivo: true, nome: 'Gênero', emojiCabecalhoId: EMOJI_CARGOS_INFO_ID, instrucao: 'Escolha seu gênero abaixo:' },
    idade: { grupo: GRUPO_IDADE, exclusivo: true, nome: 'Idade', emojiCabecalhoId: EMOJI_CARGOS_INFO_ID, instrucao: 'Escolha sua idade abaixo:' },
    regiao: { grupo: GRUPO_REGIAO, exclusivo: true, nome: 'Região', emojiCabecalhoId: EMOJI_CARGOS_INFO_ID, instrucao: 'Escolha sua região abaixo:' },
    pings: { grupo: GRUPO_PINGS, exclusivo: false, nome: 'Pings', emojiCabecalhoId: EMOJI_CARGOS_PINGS_ID, instrucao: 'Selecione seus pings no menu abaixo e clique em **Concluir Registro** quando terminar:' }
};

const ORDEM_CATEGORIAS_CARGOS = ['trofeus', 'ranqueada', 'genero', 'idade', 'regiao', 'pings'];

// Monta os botões das opções de cargos.
function montarLinhasBotoesDeCargos(prefixoCustomId, opcoes) {
    const linhas = [];
    for (let i = 0; i < opcoes.length; i += 5) {
        const fatia = opcoes.slice(i, i + 5);
        const linha = new ActionRowBuilder().addComponents(
            fatia.map(opcao => {
                const emojiSeguro = opcao.emoji.replace(/\uFE0F/g, '');
                return new ButtonBuilder()
                    .setCustomId(`${prefixoCustomId}_${opcao.id}`)
                    .setLabel(opcao.label)
                    .setEmoji(emojiSeguro)
                    .setStyle(ButtonStyle.Secondary);
            })
        );
        linhas.push(linha);
    }
    return linhas;
}

// Sincroniza os cargos escolhidos dentro de um grupo.
async function sincronizarCargosDoGrupo(membro, todosOsIdsDoGrupo, idsSelecionados) {
    const paraRemover = todosOsIdsDoGrupo.filter(id => membro.roles.cache.has(id) && !idsSelecionados.includes(id));
    const paraAdicionar = idsSelecionados.filter(id => !membro.roles.cache.has(id));

    if (paraRemover.length) await membro.roles.remove(paraRemover, 'Atualização via menu de cargos');
    if (paraAdicionar.length) await membro.roles.add(paraAdicionar, 'Atualização via menu de cargos');
}

// Fluxo de registro
const registroCargosEmAndamento = new Map();
const TTL_REGISTRO_CARGOS_MS = 15 * 60 * 1000;

// Remove registros de cargos abandonados.
function limparRegistrosCargosAntigos() {
    const agora = Date.now();
    for (const [userId, registro] of registroCargosEmAndamento) {
        if (agora - registro.atualizadoEm > TTL_REGISTRO_CARGOS_MS) registroCargosEmAndamento.delete(userId);
    }
}

// Cria o estado inicial do registro de cargos.
function criarRegistroCargosVazio() {
    return {
        escolhas: { trofeus: null, ranqueada: null, genero: null, idade: null, regiao: null },
        atualizadoEm: Date.now()
    };
}

// Monta o menu e o botão da etapa de pings.
function montarComponentesEtapaPings(membro) {
    const config = CONFIG_CATEGORIAS_CARGOS.pings;
    const idsDoGrupo = config.grupo.map(o => o.id);
    const pingsAtuais = idsDoGrupo.filter(id => membro.roles.cache.has(id));

    const selectPings = new StringSelectMenuBuilder()
        .setCustomId('cargo_select_pings')
        .setPlaceholder('Escolha seus pings')
        .setMinValues(0)
        .setMaxValues(config.grupo.length)
        .addOptions(
            config.grupo.map(opcao =>
                new StringSelectMenuOptionBuilder()
                    .setLabel(opcao.label)
                    .setValue(opcao.id)
                    .setEmoji(opcao.emoji.replace(/\uFE0F/g, ''))
                    .setDefault(pingsAtuais.includes(opcao.id))
            )
        );

    const botaoConcluir = new ButtonBuilder()
        .setCustomId('cargo_concluir_pings')
        .setLabel('Concluir Registro')
        .setStyle(ButtonStyle.Success)
        .setEmoji({ name: 'acept', id: 'SEU_ID_DISCORD' });

    return [
        new ActionRowBuilder().addComponents(selectPings),
        new ActionRowBuilder().addComponents(botaoConcluir)
    ];
}

// Obtém ou cria o progresso de cargos do usuário.
function obterOuCriarRegistroCargos(userId) {
    limparRegistrosCargosAntigos();
    let registro = registroCargosEmAndamento.get(userId);
    if (!registro) {
        registro = criarRegistroCargosVazio();
        registroCargosEmAndamento.set(userId, registro);
    }
    registro.atualizadoEm = Date.now();
    return registro;
}

// Monta o resumo dos cargos escolhidos.
function montarResumoRegistroCargos(registro, membro) {
    const linhas = ['**Seu Registro**'];
    for (const categoria of ORDEM_CATEGORIAS_CARGOS) {
        const config = CONFIG_CATEGORIAS_CARGOS[categoria];
        const emoji = tagDoEmoji(config.emojiCabecalhoId);

        if (categoria === 'pings') {
            const idsDoGrupo = config.grupo.map(o => o.id);
            const pingsAtuais = idsDoGrupo.filter(id => membro.roles.cache.has(id));
            const valor = pingsAtuais.length ? pingsAtuais.map(id => `<@&${id}>`).join(' ') : 'Nenhum';
            linhas.push(`${emoji} **${config.nome}:** ${valor}`);
        } else {
            const roleId = registro.escolhas[categoria];
            linhas.push(`${emoji} **${config.nome}:** ${roleId ? `<@&${roleId}>` : 'Não definido'}`);
        }
    }
    return linhas.join('\n');
}

// Monta o embed de uma etapa do registro.
function montarEmbedEtapaCargos(categoria, registro, membro) {
    const config = CONFIG_CATEGORIAS_CARGOS[categoria];
    const resumo = montarResumoRegistroCargos(registro, membro);
    const indiceAtual = ORDEM_CATEGORIAS_CARGOS.indexOf(categoria);
    const progresso = `${indiceAtual + 1}/${ORDEM_CATEGORIAS_CARGOS.length}`;
    const cabecalho =
        `${tagDoEmoji(config.emojiCabecalhoId)} **${config.nome.toUpperCase()}**\n` +
        `${progresso}\n\n` +
        `${config.instrucao}`;

    return new EmbedBuilder()
        .setColor(COR_CARGOS)
        .setDescription(`${resumo}\n\n${cabecalho}`);
}

// Envia uma etapa privada do registro de cargos.
async function enviarEtapaRegistroCargos(interaction, categoria, registro) {
    const config = CONFIG_CATEGORIAS_CARGOS[categoria];
    const embed = montarEmbedEtapaCargos(categoria, registro, interaction.member);
    const componentes = categoria === 'pings'
        ? montarComponentesEtapaPings(interaction.member)
        : [
            ...montarLinhasBotoesDeCargos(`cargo_botao_${categoria}`, config.grupo),
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`cargo_pular_${categoria}`)
                    .setLabel('Pular etapa')
                    .setStyle(ButtonStyle.Secondary)
            )
        ];

    return interaction.followUp({
        embeds: [embed],
        components: componentes,
        flags: MessageFlags.Ephemeral
    });
}

const callsCriadas = new Set();

async function ehCallTemporaria(canal) {
    if (!canal?.isVoiceBased()) return false;
    if (HUBS_DE_CALL.some(hub => hub.canalHubId === canal.id)) return false;
    if (callsCriadas.has(canal.id)) return true;

    for (const hub of HUBS_DE_CALL) {
        const canalHub = client.channels.cache.get(hub.canalHubId) || await client.channels.fetch(hub.canalHubId).catch(() => null);
        if (canalHub?.parentId && canal.parentId === canalHub.parentId) return true;
    }
    return false;
}

// Deduplicação de eventos
const eventosProcessadosRecentemente = new Map();
const TTL_DEDUP_MS = 5000;

// Evita processar o mesmo evento mais de uma vez.
function jaProcessadoRecentemente(chave) {
    const agora = Date.now();

    for (const [chaveAntiga, timestamp] of eventosProcessadosRecentemente) {
        if (agora - timestamp > TTL_DEDUP_MS) eventosProcessadosRecentemente.delete(chaveAntiga);
    }

    if (eventosProcessadosRecentemente.has(chave)) return true;
    eventosProcessadosRecentemente.set(chave, agora);
    return false;
}

// Cria um link clicável para um canal do servidor.
function linkDoCanal(texto, canalId, guildId) {
    return `[${texto}](https://discord.com/channels/${guildId}/${canalId})`;
}

async function obterExecutorCanal(guild, tipoAuditLog, targetId) {
    if (!guild || !targetId) return null;

    try {
        const logs = await guild.fetchAuditLogs({ type: tipoAuditLog, limit: 10 });
        const entrada = logs.entries.find(entry => entry.target && entry.target.id === targetId);
        return entrada?.executor ?? null;
    } catch (error) {
        console.error('[log-canais] Erro ao buscar executor no audit log:', error);
        return null;
    }
}

function formatarTipoCanal(channel) {
    const tipos = {
        [ChannelType.GuildText]: 'Texto',
        [ChannelType.GuildVoice]: 'Call',
        [ChannelType.GuildCategory]: 'Categoria',
        [ChannelType.GuildAnnouncement]: 'Anúncio',
        [ChannelType.GuildForum]: 'Fórum',
        [ChannelType.GuildStageVoice]: 'Stage',
        [ChannelType.PublicThread]: 'Thread pública',
        [ChannelType.PrivateThread]: 'Thread privada',
        [ChannelType.AnnouncementThread]: 'Thread de anúncio'
    };

    return tipos[channel?.type] ?? 'Canal';
}

async function enviarLogCanal(guild, { titulo, cor, descricao, channel, executor }) {
    if (!guild) return;

    const canalLog = guild.channels.cache.get(CANAL_LOG_CANAIS_ID) || await guild.channels.fetch(CANAL_LOG_CANAIS_ID).catch(() => null);
    if (!canalLog || !canalLog.isTextBased()) {
        console.error(`[log-canais] Canal de log não encontrado ou inválido: ${CANAL_LOG_CANAIS_ID}`);
        return;
    }

    const executorTag = executor ? `<@${executor.id}>` : 'Desconhecido';
    const nomeCanal = channel?.name || 'Sem nome';
    const tipoCanal = formatarTipoCanal(channel);

    const embed = new EmbedBuilder()
        .setColor(cor)
        .setTitle(titulo)
        .setDescription(descricao)
        .addFields(
            { name: 'Nome', value: `**${nomeCanal}**`, inline: true },
            { name: 'Tipo', value: tipoCanal, inline: true },
            { name: 'Quem executou', value: executorTag, inline: true },
            { name: 'ID', value: `\`${channel?.id ?? 'desconhecido'}\``, inline: false }
        )
        .setTimestamp();

    await canalLog.send({ embeds: [embed] });
}

async function enviarLogCargo(guild, { titulo, cor, descricao, role, executor }) {
    if (!guild) return;

    const canalLog = guild.channels.cache.get(CANAL_LOG_CARGOS_ID) || await guild.channels.fetch(CANAL_LOG_CARGOS_ID).catch(() => null);
    if (!canalLog || !canalLog.isTextBased()) {
        console.error(`[log-cargos] Canal de log não encontrado ou inválido: ${CANAL_LOG_CARGOS_ID}`);
        return;
    }

    const executorTag = executor ? `<@${executor.id}>` : 'Desconhecido';
    const nomeCargo = role?.name || 'Sem nome';
    const embed = new EmbedBuilder()
        .setColor(cor)
        .setTitle(titulo)
        .setDescription(descricao)
        .addFields(
            { name: 'Nome', value: `**${nomeCargo}**`, inline: true },
            { name: 'Quem executou', value: executorTag, inline: true },
            { name: 'ID', value: `\`${role?.id ?? 'desconhecido'}\``, inline: false }
        )
        .setTimestamp();

    await canalLog.send({ embeds: [embed] });
}

const atualizacoesContadorBoosters = new Map();
const sessoesDeVoz = new Map();
const ultimosTotaisMensagensExibidos = new Map();

async function entrarNaCallAutomatica() {
    if (DISABLE_VOICE) {
        console.warn('[voz] Entrada automártica em call desativada por DISABLE_VOICE=true.');
        return;
    }

    try {
        const canal = await client.channels.fetch(CANAL_ENTRADA_AUTOMATICA_ID);
        if (!canal?.isVoiceBased() || !canal.guild) {
            console.error(`[voz] O canal ${CANAL_ENTRADA_AUTOMATICA_ID} não é um canal de voz válido.`);
            return;
        }

        const connection = joinVoiceChannel({
            channelId: canal.id,
            guildId: canal.guild.id,
            adapterCreator: canal.guild.voiceAdapterCreator,
            selfDeaf: true
        });

        connection.on('error', error => {
            console.warn('[voz] Conexão de voz falhou:', error?.message || error);
        });

        console.log(`Bot entrou na call ${canal.name} (${canal.id}).`);
    } catch (error) {
        console.error(`[voz] Não foi possível entrar na call ${CANAL_ENTRADA_AUTOMATICA_ID}:`, error);
    }
}

// Carrega os dados persistidos de perfis e status.
function carregarEstadoPerfis() {
    if (!fs.existsSync(CAMINHO_ESTADO_PERFIS)) return {};
    try {
        return JSON.parse(fs.readFileSync(CAMINHO_ESTADO_PERFIS, 'utf8'));
    } catch (error) {
        console.error('[perfil] Erro ao ler estado dos perfis:', error);
        return {};
    }
}

const estadoCarregado = carregarEstadoPerfis();
const estadoPerfis = estadoCarregado.perfis || estadoCarregado;
const estadoStatus = estadoCarregado.status || {};
const estadoTotaisServidores = estadoCarregado.totaisServidores || {};
const estadoEconomia = estadoCarregado.economia || {};
const estadoSessoesVoz = estadoCarregado.sessoesVoz || {};
const estadoComprasLegado = estadoCarregado.compras || {};
function carregarCargosVip() {
    if (!fs.existsSync(CAMINHO_ESTADO_CARGOS_VIP)) return {};
    try {
        return JSON.parse(fs.readFileSync(CAMINHO_ESTADO_CARGOS_VIP, 'utf8'));
    } catch (error) {
        console.error('[vip] Erro ao ler estado dos cargos VIP:', error);
        return {};
    }
}

// Carrega o arquivo de rastreamento de cargos VIPs (quando foram adquiridos)
function carregarRastreamentoCargosVip() {
    if (!fs.existsSync(CAMINHO_RASTREAMENTO_CARGOS_VIP)) return {};
    try {
        return JSON.parse(fs.readFileSync(CAMINHO_RASTREAMENTO_CARGOS_VIP, 'utf8'));
    } catch (error) {
        console.error('[rastreamento-vip] Erro ao ler rastreamento de cargos VIP:', error);
        return {};
    }
}

// Salva o arquivo de rastreamento de cargos VIPs
function salvarRastreamentoCargosVip() {
    try {
        const arquivoTemporario = `${CAMINHO_RASTREAMENTO_CARGOS_VIP}.tmp`;
        fs.writeFileSync(arquivoTemporario, JSON.stringify(rastreamentoCargosVip, null, 2));
        fs.renameSync(arquivoTemporario, CAMINHO_RASTREAMENTO_CARGOS_VIP);
    } catch (error) {
        console.error('[rastreamento-vip] Erro ao salvar rastreamento de cargos VIP:', error);
    }
}

const estadoCompras = carregarCargosVip();
const rastreamentoCargosVip = carregarRastreamentoCargosVip();
for (const [guildId, usuarios] of Object.entries(estadoComprasLegado)) {
    estadoCompras[guildId] ??= {};
    for (const [usuarioId, cargos] of Object.entries(usuarios || {})) {
        estadoCompras[guildId][usuarioId] ??= { ...cargos };
    }
}
const estadoBeneficios = estadoCarregado.beneficios || {};
const estadoCargosPersonalizados = estadoCarregado.cargosPersonalizados || {};
const estadoCallsPersonalizadas = estadoCarregado.callsPersonalizadas || {};
for (const perfil of Object.values(estadoPerfis)) {
    perfil.marcosMensagensPagos ??= Math.floor((perfil.mensagens || 0) / MENSAGENS_POR_MARCO);
    perfil.horasCallPagas ??= Math.floor((perfil.vozMs || 0) / HORA_EM_MS);
}
for (const [guildId, dias] of Object.entries(estadoStatus)) {
    if (estadoTotaisServidores[guildId]) continue;
    const total = { mensagens: 0, vozMs: 0 };
    for (const dados of Object.values(dias || {})) {
        total.mensagens += Object.values(dados.mensagens || {}).reduce((soma, valor) => soma + Number(valor || 0), 0);
        total.vozMs += Object.values(dados.vozMs || {}).reduce((soma, valor) => soma + Number(valor || 0), 0);
    }
    estadoTotaisServidores[guildId] = total;
}
let salvamentoPerfisAgendado = null;

// Agenda o salvamento dos dados de perfis.
function salvarEstadoPerfis() {
    if (salvamentoPerfisAgendado) return;
    salvamentoPerfisAgendado = setTimeout(() => {
        salvamentoPerfisAgendado = null;
        const arquivoTemporario = `${CAMINHO_ESTADO_PERFIS}.tmp`;
        try {
            fs.writeFileSync(arquivoTemporario, JSON.stringify({ perfis: estadoPerfis, status: estadoStatus, totaisServidores: estadoTotaisServidores, economia: estadoEconomia, sessoesVoz: estadoSessoesVoz, compras: estadoCompras, beneficios: estadoBeneficios, cargosPersonalizados: estadoCargosPersonalizados, callsPersonalizadas: estadoCallsPersonalizadas }, null, 2));
            if (fs.existsSync(CAMINHO_ESTADO_PERFIS)) {
                fs.copyFileSync(CAMINHO_ESTADO_PERFIS, `${CAMINHO_ESTADO_PERFIS}.bak`);
            }
            fs.renameSync(arquivoTemporario, CAMINHO_ESTADO_PERFIS);
            const arquivoVipTemporario = `${CAMINHO_ESTADO_CARGOS_VIP}.tmp`;
            fs.writeFileSync(arquivoVipTemporario, JSON.stringify(estadoCompras, null, 2));
            fs.renameSync(arquivoVipTemporario, CAMINHO_ESTADO_CARGOS_VIP);
        } catch (error) {
            console.error('[perfil] Erro ao salvar estado:', error);
        }
    }, 1000);
}

// Agenda o salvamento dos dados de status.
function salvarEstadoStatus() {
    salvarEstadoPerfis();
}

// Retorna a data usada nas estatísticas diárias.
function obterDiaAtual(data = new Date()) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

// Obtém ou cria o saldo de gemas de um usuário.
function obterContaEconomia(guildId, usuarioId) {
    if (!estadoEconomia[guildId]) estadoEconomia[guildId] = {};
    if (!estadoEconomia[guildId][usuarioId]) {
        estadoEconomia[guildId][usuarioId] = { gemas: 0, ultimoBau: 0 };
    }
    return estadoEconomia[guildId][usuarioId];
}

function obterComprasUsuario(guildId, usuarioId) {
    estadoCompras[guildId] ??= {};
    estadoCompras[guildId][usuarioId] ??= {};
    return estadoCompras[guildId][usuarioId];
}

function clonarLimitesBeneficios(cargo) {
    return {
        cargosPersonalizados: cargo.limitesBeneficios.cargosPersonalizados,
        callsPersonalizadas: cargo.limitesBeneficios.callsPersonalizadas,
        vmutes: cargo.limitesBeneficios.vmutes.map(vmute => ({ ...vmute, restante: vmute.quantidade }))
    };
}

function inicializarBeneficiosCargo(guildId, usuarioId, cargo) {
    estadoBeneficios[guildId] ??= {};
    estadoBeneficios[guildId][usuarioId] ??= {};
    estadoBeneficios[guildId][usuarioId][cargo.id] ??= clonarLimitesBeneficios(cargo);
    return estadoBeneficios[guildId][usuarioId][cargo.id];
}

function obterBeneficiosUsuario(guildId, usuarioId, cargo) {
    return inicializarBeneficiosCargo(guildId, usuarioId, cargo);
}

function consumirBeneficio(guildId, usuarioId, cargoId, tipo, indiceVmute = 0) {
    const cargo = CARGOS_LOJA.find(item => item.id === cargoId);
    if (!cargo) return false;
    const beneficios = inicializarBeneficiosCargo(guildId, usuarioId, cargo);
    if (tipo === 'cargosPersonalizados' || tipo === 'callsPersonalizadas') {
        if (beneficios[tipo] <= 0) return false;
        beneficios[tipo]--;
    } else if (tipo === 'vmute') {
        const vmute = beneficios.vmutes[indiceVmute];
        if (!vmute || vmute.restante <= 0) return false;
        vmute.restante--;
    } else {
        return false;
    }
    salvarEstadoPerfis();
    return true;
}

function devolverBeneficio(guildId, usuarioId, cargoId, tipo, indiceVmute = 0) {
    const cargo = CARGOS_LOJA.find(item => item.id === cargoId);
    if (!cargo) return false;
    const beneficios = inicializarBeneficiosCargo(guildId, usuarioId, cargo);
    if (tipo === 'cargosPersonalizados' || tipo === 'callsPersonalizadas') {
        beneficios[tipo]++;
    } else if (tipo === 'vmute') {
        const vmute = beneficios.vmutes[indiceVmute];
        if (!vmute) return false;
        vmute.restante++;
    } else {
        return false;
    }
    salvarEstadoPerfis();
    return true;
}

function listarCargosPersonalizados(guildId, usuarioId) {
    return (estadoCargosPersonalizados[guildId]?.[usuarioId] || []).filter(item =>
        client.guilds.cache.get(guildId)?.roles.cache.has(item.roleId)
    );
}

function registrarCargoPersonalizado(guildId, usuarioId, role) {
    estadoCargosPersonalizados[guildId] ??= {};
    estadoCargosPersonalizados[guildId][usuarioId] ??= [];
    estadoCargosPersonalizados[guildId][usuarioId].push({ roleId: role.id, name: role.name });
    salvarEstadoPerfis();
}

function listarCallsPersonalizadas(guildId, usuarioId) {
    return (estadoCallsPersonalizadas[guildId]?.[usuarioId] || []).filter(item =>
        client.channels.cache.has(item.channelId)
    );
}

function registrarCallPersonalizada(guildId, usuarioId, channel) {
    estadoCallsPersonalizadas[guildId] ??= {};
    estadoCallsPersonalizadas[guildId][usuarioId] ??= [];
    estadoCallsPersonalizadas[guildId][usuarioId].push({ channelId: channel.id, name: channel.name });
    salvarEstadoPerfis();
}

function consumirVmuteDisponivel(guildId, usuarioId, duracao) {
    const compras = estadoCompras[guildId]?.[usuarioId] || {};
    const membro = client.guilds.cache.get(guildId)?.members.cache.get(usuarioId);
    const agora = Date.now();
    for (const cargo of CARGOS_LOJA) {
        if (!membro?.roles.cache.has(cargo.id)) continue;
        if (compras[cargo.id] && Number(compras[cargo.id]) <= agora) continue;
        const beneficios = obterBeneficiosUsuario(guildId, usuarioId, cargo);
        const indice = beneficios.vmutes.findIndex(vmute => vmute.duracao === duracao && vmute.restante > 0);
        if (indice !== -1) return consumirBeneficio(guildId, usuarioId, cargo.id, 'vmute', indice);
    }
    return false;
}

function devolverVmuteDisponivel(guildId, usuarioId, duracao) {
    const compras = estadoCompras[guildId]?.[usuarioId] || {};
    const membro = client.guilds.cache.get(guildId)?.members.cache.get(usuarioId);
    const agora = Date.now();
    for (const cargo of CARGOS_LOJA) {
        if (!membro?.roles.cache.has(cargo.id)) continue;
        if (compras[cargo.id] && Number(compras[cargo.id]) <= agora) continue;
        const beneficios = obterBeneficiosUsuario(guildId, usuarioId, cargo);
        const vmute = beneficios.vmutes.find(item => item.duracao === duracao);
        if (vmute) {
            vmute.restante++;
            salvarEstadoPerfis();
            return true;
        }
    }
    return false;
}

function temVmuteDisponivel(guildId, usuarioId, duracao) {
    const compras = estadoCompras[guildId]?.[usuarioId] || {};
    const membro = client.guilds.cache.get(guildId)?.members.cache.get(usuarioId);
    const agora = Date.now();
    return CARGOS_LOJA.some(cargo => {
        if (!membro?.roles.cache.has(cargo.id)) return false;
        if (compras[cargo.id] && Number(compras[cargo.id]) <= agora) return false;
        const beneficios = obterBeneficiosUsuario(guildId, usuarioId, cargo);
        return beneficios.vmutes.some(vmute => vmute.duracao === duracao && vmute.restante > 0);
    });
}

function obterCargoComBeneficioDisponivel(guildId, usuarioId, tipo) {
    const guild = client.guilds.cache.get(guildId);
    const membro = guild?.members.cache.get(usuarioId) || null;
    const compras = estadoCompras[guildId]?.[usuarioId] || {};

    return CARGOS_LOJA.find(cargo => {
        const cargoAtivoNoDiscord = Boolean(membro?.roles.cache.has(cargo.id));
        const cargoAtivoNaCompra = Number(compras[cargo.id] || 0) > Date.now();
        if (!cargoAtivoNoDiscord && !cargoAtivoNaCompra) return false;

        const beneficios = obterBeneficiosUsuario(guildId, usuarioId, cargo);
        return tipo === 'vmutes'
            ? beneficios.vmutes.some(vmute => vmute.restante > 0)
            : beneficios[tipo] > 0;
    }) || null;
}

async function removerCargosExpirados() {
    const agora = Date.now();
    for (const [guildId, usuarios] of Object.entries(estadoCompras)) {
        const guild = client.guilds.cache.get(guildId);
        for (const [usuarioId, compras] of Object.entries(usuarios)) {
            for (const [cargoId, expiraEm] of Object.entries(compras)) {
                if (expiraEm > agora) continue;
                const membro = guild?.members.cache.get(usuarioId) || await guild?.members.fetch(usuarioId).catch(() => null);
                if (membro?.roles.cache.has(cargoId)) await membro.roles.remove(cargoId, 'Compra de cargo expirada').catch(() => {});
                delete compras[cargoId];
            }
            if (!Object.keys(compras).length) delete usuarios[usuarioId];
        }
        if (!Object.keys(usuarios).length) delete estadoCompras[guildId];
    }
    salvarEstadoPerfis();
}

async function sincronizarCargosVip(decrementar = true) {
    const agora = Date.now();
    let alterado = false;
    let rastreamentoAlterado = false;
    
    for (const [guildId, usuarios] of Object.entries(estadoCompras)) {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) continue;
        
        for (const [usuarioId, cargos] of Object.entries(usuarios)) {
            const membro = await guild.members.fetch(usuarioId).catch(() => null);
            if (!membro) continue;
            
            // Inicializa a entrada do usuário no rastreamento se não existir
            rastreamentoCargosVip[guildId] ??= {};
            rastreamentoCargosVip[guildId][usuarioId] ??= {};
            
            for (const [cargoId, expiraEm] of Object.entries(cargos)) {
                if (!CARGOS_LOJA.some(cargo => cargo.id === cargoId) || !membro.roles.cache.has(cargoId)) {
                    delete cargos[cargoId];
                    // Remove do rastreamento também
                    if (rastreamentoCargosVip[guildId][usuarioId][cargoId]) {
                        delete rastreamentoCargosVip[guildId][usuarioId][cargoId];
                        rastreamentoAlterado = true;
                    }
                    alterado = true;
                    continue;
                }

                const novaExpiracao = Number(expiraEm);
                
                // Detecta novo cargo VIP (que não estava no rastreamento)
                if (!rastreamentoCargosVip[guildId][usuarioId][cargoId]) {
                    rastreamentoCargosVip[guildId][usuarioId][cargoId] = novaExpiracao;
                    rastreamentoAlterado = true;
                    console.log(`[rastreamento-vip] Novo cargo detectado: ${membro.user.tag} adquiriu cargo ${cargoId} em ${new Date(agora).toLocaleString('pt-BR')}`);
                } else {
                    // Atualiza o tempo existente
                    rastreamentoCargosVip[guildId][usuarioId][cargoId] = novaExpiracao;
                    rastreamentoAlterado = true;
                }
                
                if (novaExpiracao <= agora) {
                    await membro.roles.remove(cargoId, 'Cargo VIP expirado').catch(() => {});
                    delete cargos[cargoId];
                    if (rastreamentoCargosVip[guildId][usuarioId][cargoId]) {
                        delete rastreamentoCargosVip[guildId][usuarioId][cargoId];
                    }
                } else {
                    cargos[cargoId] = novaExpiracao;
                }
                alterado = true;
            }
            
            if (!Object.keys(cargos).length) delete usuarios[usuarioId];
            if (!Object.keys(rastreamentoCargosVip[guildId][usuarioId]).length) delete rastreamentoCargosVip[guildId][usuarioId];
        }
        
        if (!Object.keys(usuarios).length) delete estadoCompras[guildId];
        if (!Object.keys(rastreamentoCargosVip[guildId] || {}).length) delete rastreamentoCargosVip[guildId];
    }
    
    if (alterado) salvarEstadoPerfis();
    if (rastreamentoAlterado) salvarRastreamentoCargosVip();
}

function enviarAvisoRecompensa(canal, usuarioId, quantidade, motivo) {
    client.users.fetch(usuarioId)
        .then(usuario => usuario.send(`🎁 Você ganhou **${quantidade} ${EMOJI_GEMA}** por ${motivo}!`))
        .catch(() => {});
}

function verificarRecompensaMensagens(guild, usuario, canal) {
    const perfil = obterEstatisticasPerfil(usuario.id);
    const marcosAtingidos = Math.floor(perfil.mensagens / MENSAGENS_POR_MARCO);
    const marcosPagos = perfil.marcosMensagensPagos;
    if (marcosAtingidos <= marcosPagos) return;
    const quantidade = (marcosAtingidos - marcosPagos) * GEMAS_POR_MARCO_MENSAGENS;
    obterContaEconomia(guild.id, usuario.id).gemas += quantidade;
    perfil.marcosMensagensPagos = marcosAtingidos;
    salvarEstadoPerfis();
    enviarAvisoRecompensa(canal, usuario.id, quantidade, `${marcosAtingidos - marcosPagos} marco(s) de 100 mensagens`);
}

function verificarRecompensaCall(guild, usuarioId, canal) {
    const perfil = obterEstatisticasPerfil(usuarioId);
    const sessao = sessoesDeVoz.get(usuarioId);
    const tempoTotal = perfil.vozMs + (sessao?.guildId === guild.id ? Date.now() - sessao.inicio : 0);
    const horasAtingidas = Math.floor(tempoTotal / HORA_EM_MS);
    const horasPagas = perfil.horasCallPagas;
    if (horasAtingidas <= horasPagas) return;
    const quantidade = (horasAtingidas - horasPagas) * GEMAS_POR_HORA_CALL;
    obterContaEconomia(guild.id, usuarioId).gemas += quantidade;
    perfil.horasCallPagas = horasAtingidas;
    salvarEstadoPerfis();
    enviarAvisoRecompensa(canal, usuarioId, quantidade, `${horasAtingidas - horasPagas} hora(s) de call`);
}

// Monta o embed de recompensa do baú.
function montarEmbedBau(usuario, recompensa, conta) {
    const nomeExecutor = usuario?.user?.username || usuario?.username || 'Desconhecido';
    return new EmbedBuilder()
        .setColor(0x00FFFF)
        .setDescription(
            `## <:fekz5wrtflfd1:SEU_ID_DISCORD> BAU DA PENNY\n\n` +
            `**Você abriu o baú da Penny e ganhou um tesouro!**\n\n` +
            `**Você ganhou ${recompensa} ${EMOJI_GEMA}!**`
        )
        .setFooter({
            text: `Total de gemas: ${conta.gemas.toLocaleString('pt-BR')}\n` +
                `Executado por: ${nomeExecutor}\n` +
                `Data: ${new Date().toLocaleString('pt-BR')}`
        });
}

// Obtém ou cria os dados de um dia do servidor.
function obterDadosDiarios(guildId, dia = obterDiaAtual()) {
    if (!estadoStatus[guildId]) estadoStatus[guildId] = {};
    if (!estadoStatus[guildId][dia]) {
        estadoStatus[guildId][dia] = { mensagens: {}, canaisMensagens: {}, vozMs: {}, canaisVozMs: {} };
    }
    return estadoStatus[guildId][dia];
}

function obterTotaisServidor(guildId) {
    estadoTotaisServidores[guildId] ??= { mensagens: 0, vozMs: 0 };
    return estadoTotaisServidores[guildId];
}

// Registra uma mensagem nas estatísticas diárias.
function registrarMensagemStatus(guildId, usuarioId, canalId) {
    const dados = obterDadosDiarios(guildId);
    obterTotaisServidor(guildId).mensagens++;
    dados.mensagens[usuarioId] = (dados.mensagens[usuarioId] || 0) + 1;
    dados.canaisMensagens[canalId] = (dados.canaisMensagens[canalId] || 0) + 1;
    salvarEstadoStatus();
}

// Registra o tempo de voz separado por dia.
function registrarIntervaloVozStatus(guildId, usuarioId, canalId, inicio, fim) {
    let cursor = new Date(inicio);
    const final = new Date(fim);
    while (cursor < final) {
        const proximoDia = new Date(cursor);
        proximoDia.setHours(24, 0, 0, 0);
        const fimDoTrecho = proximoDia < final ? proximoDia : final;
        const tempoMs = fimDoTrecho.getTime() - cursor.getTime();
        obterTotaisServidor(guildId).vozMs += tempoMs;
        const dados = obterDadosDiarios(guildId, obterDiaAtual(cursor));
        dados.vozMs[usuarioId] = (dados.vozMs[usuarioId] || 0) + tempoMs;
        dados.canaisVozMs[canalId] = (dados.canaisVozMs[canalId] || 0) + tempoMs;
        cursor = fimDoTrecho;
    }
    salvarEstadoStatus();
}

// Soma todo o histórico persistido do servidor.
function somarEstatisticasStatus(guildId) {
    const mensagensPorUsuario = {};
    const mensagensPorCanal = {};
    const vozPorUsuario = {};
    const vozPorCanal = {};

    for (const dados of Object.values(estadoStatus[guildId] || {})) {
        for (const [id, quantidade] of Object.entries(dados.mensagens)) mensagensPorUsuario[id] = (mensagensPorUsuario[id] || 0) + quantidade;
        for (const [id, quantidade] of Object.entries(dados.canaisMensagens)) mensagensPorCanal[id] = (mensagensPorCanal[id] || 0) + quantidade;
        for (const [id, tempo] of Object.entries(dados.vozMs)) vozPorUsuario[id] = (vozPorUsuario[id] || 0) + tempo;
        for (const [id, tempo] of Object.entries(dados.canaisVozMs)) vozPorCanal[id] = (vozPorCanal[id] || 0) + tempo;
    }
    return { mensagensPorUsuario, mensagensPorCanal, vozPorUsuario, vozPorCanal };
}

// Formata milissegundos como horas e minutos.
function formatarHorasStatus(tempoMs) {
    const minutosTotais = Math.max(0, Math.floor(tempoMs / 60000));
    const horas = Math.floor(minutosTotais / 60);
    const minutos = String(minutosTotais % 60).padStart(2, '0');
    return `${horas}:${minutos}`;
}

function montarComponentesStatus(categoria) {
    return [new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('status_categoria_call')
            .setLabel('Horas de call')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(categoria === 'call'),
        new ButtonBuilder()
            .setCustomId('status_categoria_chat')
            .setLabel('Mensagens')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(categoria === 'chat'),
        new ButtonBuilder()
            .setCustomId('status_categoria_gemas')
            .setLabel('Gemas')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(categoria === 'gemas')
    )];
}

// Monta o relatório de status do servidor.
async function montarEmbedStatus(guild, categoria = 'total') {
    const dados = somarEstatisticasStatus(guild.id);
    const agora = Date.now();
    for (const [usuarioId, sessao] of sessoesDeVoz) {
        if (sessao.guildId !== guild.id) continue;
        let cursor = new Date(sessao.inicio);
        const final = new Date(agora);
        while (cursor < final) {
            const proximoDia = new Date(cursor);
            proximoDia.setHours(24, 0, 0, 0);
            const fimDoTrecho = proximoDia < final ? proximoDia : final;
            const tempoAtual = fimDoTrecho.getTime() - cursor.getTime();
            dados.vozPorUsuario[usuarioId] = (dados.vozPorUsuario[usuarioId] || 0) + tempoAtual;
            dados.vozPorCanal[sessao.canalId] = (dados.vozPorCanal[sessao.canalId] || 0) + tempoAtual;
            cursor = fimDoTrecho;
        }
    }
    const rankingUsuariosMensagens = Object.entries(dados.mensagensPorUsuario)
        .sort((a, b) => b[1] - a[1]).slice(0, 5);
    const rankingUsuariosVoz = Object.entries(dados.vozPorUsuario)
        .sort((a, b) => b[1] - a[1]).slice(0, 5);
    const rankingCanaisMensagens = Object.entries(dados.mensagensPorCanal)
        .sort((a, b) => b[1] - a[1]).slice(0, 5);
    const rankingCanaisVoz = Object.entries(dados.vozPorCanal)
        .sort((a, b) => b[1] - a[1]).slice(0, 5);
    const rankingUsuariosGemas = obterTopGemas(guild);
    const gemasTotais = Object.values(estadoEconomia[guild.id] || {})
        .reduce((total, conta) => total + Number(conta.gemas || 0), 0);
    const mensagensTotais = Object.values(dados.mensagensPorUsuario).reduce((soma, valor) => soma + valor, 0);
    let vozTotalMs = Object.values(dados.vozPorUsuario).reduce((soma, valor) => soma + valor, 0);
    for (const sessao of sessoesDeVoz.values()) {
        if (sessao.guildId === guild.id) vozTotalMs += agora - sessao.inicio;
    }
    const formatarRanking = (ranking, formatarValor, canal = false) => ranking.length
        ? ranking.map(([id, valor], indice) => `${indice + 1}. ${canal ? `<#${id}>` : `<@${id}>`} — ${formatarValor(valor)}`).join('\n')
        : 'Nenhuma atividade registrada';
    const ehCall = categoria === 'call';
    const ehChat = categoria === 'chat';
    const ehGemas = categoria === 'gemas';
    const campos = [];
    if (ehGemas) {
        campos.push({
            name: '\u200b',
            value: rankingUsuariosGemas.length
                ? rankingUsuariosGemas.map((item, indice) => `${indice + 1}. <@${item.usuarioId}> — ${item.valor.toLocaleString('pt-BR')} ${EMOJI_GEMA}`).join('\n')
                : 'Nenhuma gema registrada'
        });
    } else if (!ehChat) {
        campos.push({
            name: '\u200b',
            value: `**Canais mais ativos**\n${formatarRanking(rankingCanaisVoz, formatarHorasStatus, true)}\n\n**Usuários com mais tempo**\n${formatarRanking(rankingUsuariosVoz, formatarHorasStatus)}`
        });
    }
    if (!ehCall && !ehGemas) {
        campos.push({
            name: '\u200b',
            value: `**Canais mais ativos**\n${formatarRanking(rankingCanaisMensagens, valor => `${valor} mensagem(ns)`, true)}\n\n**Usuários com mais mensagens**\n${formatarRanking(rankingUsuariosMensagens, valor => `${valor} mensagem(ns)`)}`
        });
    }
    return new EmbedBuilder()
        .setColor(0x3498DB)
        .setDescription(
            `## Status do servidor - ${ehGemas ? 'Gemas' : ehCall ? 'Horas de call' : ehChat ? 'Mensagens' : 'Geral'}\n` +
            (ehGemas
                ? `Gemas no servidor: \`${gemasTotais.toLocaleString('pt-BR')}\`\nUsuários com mais gemas`
                : ehCall
                ? `Horas de call: \`${formatarHorasStatus(vozTotalMs)}\``
                : ehChat
                    ? `Mensagens: \`${mensagensTotais}\``
                    : `Mensagens: \`${mensagensTotais}\`\nHoras de call: \`${formatarHorasStatus(vozTotalMs)}\``)
        )
            .addFields(campos)
        .setTimestamp();
}

// Obtém ou cria as estatísticas totais de um usuário.
function obterEstatisticasPerfil(usuarioId) {
    if (!estadoPerfis[usuarioId]) {
        estadoPerfis[usuarioId] = { mensagens: 0, vozMs: 0, marcosMensagensPagos: 0, horasCallPagas: 0 };
    }
    return estadoPerfis[usuarioId];
}

// Adiciona uma sessão encerrada ao perfil do usuário.
function adicionarTempoDeVoz(usuarioId, inicio) {
    const estatisticas = obterEstatisticasPerfil(usuarioId);
    estatisticas.vozMs += Date.now() - inicio;
    salvarEstadoPerfis();
}

function acumularTempoSessaoVoz(usuarioId, sessao, fim) {
    const tempoDecorrido = fim - sessao.inicio;
    if (tempoDecorrido <= 0) return false;

    obterEstatisticasPerfil(usuarioId).vozMs += tempoDecorrido;
    registrarIntervaloVozStatus(sessao.guildId, usuarioId, sessao.canalId, sessao.inicio, fim);
    return true;
}

// Consolida o tempo das sessões ativas para reduzir perdas em reinícios.
function salvarTempoSessoesVoz() {
    const agora = Date.now();
    let houveAlteracao = false;
    const totaisAntigos = new Map();

    for (const [usuarioId, sessao] of sessoesDeVoz) {
        if (!totaisAntigos.has(sessao.guildId)) {
            totaisAntigos.set(sessao.guildId, obterTotaisServidor(sessao.guildId).vozMs);
        }
        if (!acumularTempoSessaoVoz(usuarioId, sessao, agora)) continue;
        sessao.inicio = agora;
        estadoSessoesVoz[usuarioId] = sessao;
        houveAlteracao = true;
    }

    if (houveAlteracao) {
        for (const [guildId, horasAntigas] of totaisAntigos) {
            const horasNovas = obterTotaisServidor(guildId).vozMs;
            if (horasNovas !== horasAntigas) {
                console.log(`[voz] Horas totais guardadas: ${formatarHorasStatus(horasAntigas)} > ${formatarHorasStatus(horasNovas)}`);
            }
        }
        salvarEstadoPerfis();
    }
}

// Formata as horas totais de call do perfil.
function formatarHorasPerfil(usuarioId, guildId) {
    const estatisticas = obterEstatisticasPerfil(usuarioId);
    let vozMs = estatisticas.vozMs;
    const sessao = sessoesDeVoz.get(usuarioId);
    if (sessao && (!guildId || sessao.guildId === guildId)) vozMs += Date.now() - sessao.inicio;
    return formatarHorasStatus(vozMs);
}

// Retorna a atividade de um usuário no período selecionado.
function obterAtividadeUsuario(guild, usuarioId) {
    const dados = somarEstatisticasStatus(guild.id);
    let mensagens = dados.mensagensPorUsuario[usuarioId] || 0;
    let vozMs = dados.vozPorUsuario[usuarioId] || 0;
    const agora = Date.now();
    const sessao = sessoesDeVoz.get(usuarioId);
    if (sessao?.guildId === guild.id) {
        vozMs += agora - sessao.inicio;
    }
    return { mensagens, vozMs };
}

// Retorna os dez usuários mais ativos em uma categoria.
function obterTopAtividade(guild, categoria) {
    const dados = somarEstatisticasStatus(guild.id);
    const usuarios = new Set();
    const valores = categoria === 'horas' ? dados.vozPorUsuario : dados.mensagensPorUsuario;
    for (const usuarioId of Object.keys(valores)) {
        usuarios.add(usuarioId);
    }
    for (const [usuarioId, sessao] of sessoesDeVoz) {
        if (sessao.guildId === guild.id) usuarios.add(usuarioId);
    }

    const ranking = [...usuarios].filter(Boolean).map(usuarioId => {
        let valor = valores[usuarioId] || 0;
        const sessao = sessoesDeVoz.get(usuarioId);
        if (categoria === 'horas' && sessao?.guildId === guild.id) {
            valor += Date.now() - sessao.inicio;
        }
        return { usuarioId, valor };
    });
    return ranking.sort((a, b) => b.valor - a.valor).slice(0, 10);
}

// Monta a lista dos dez maiores saldos de gemas.
function obterTopGemas(guild) {
    return Object.entries(estadoEconomia[guild.id] || {})
        .map(([usuarioId, conta]) => ({ usuarioId, valor: conta.gemas || 0 }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 10);
}

// Formata uma lista de ranking do servidor.
function formatarListaRanking(ranking, formatarValor) {
    return ranking.length
        ? ranking.map((item, indice) => `${indice + 1}. <@${item.usuarioId}> — ${formatarValor(item.valor)}`).join('\n')
        : 'Nenhum dado registrado';
}

// Atualiza o contador de boosters na mensagem existente.
async function atualizarContadorBoosters(guild) {
    try {
        const quantidadeBoosts = guild.premiumSubscriptionCount ?? 0;

        const canal = await guild.channels.fetch(CANAL_BOOSTERS_ID);
        if (!canal?.isTextBased()) return;

        const mensagens = await canal.messages.fetch({ limit: 100 });
        const mensagemBanner = mensagens.find(mensagem =>
            mensagem.author.id === client.user.id &&
            mensagem.embeds[0]?.description?.includes(`<@&${CARGO_BOOSTER_ID}>`)
        );
        if (!mensagemBanner?.embeds[0]?.description) return;

        const contador = new RegExp(`(<@&${CARGO_BOOSTER_ID}> \\*\\*)\\d+(/17\\*\\*)`);
        const descricaoAtualizada = mensagemBanner.embeds[0].description.replace(
            contador,
            `$1${quantidadeBoosts}$2`
        );
        if (descricaoAtualizada === mensagemBanner.embeds[0].description) return;

        await mensagemBanner.edit({
            embeds: [EmbedBuilder.from(mensagemBanner.embeds[0]).setDescription(descricaoAtualizada)]
        });
        console.log(`✅ Contador de boosts atualizado: ${quantidadeBoosts}/17`);
    } catch (error) {
        console.error('[boosters] Erro ao atualizar contador:', error);
    }
}

client.on('guildUpdate', (guildAntiga, guildAtualizada) => {
    if (guildAntiga.premiumSubscriptionCount !== guildAtualizada.premiumSubscriptionCount) {
        agendarAtualizacaoContadorBoosters(guildAtualizada);
    }
});

// Agrupa atualizações próximas do contador de boosters.
function agendarAtualizacaoContadorBoosters(guild) {
    const atualizacaoAnterior = atualizacoesContadorBoosters.get(guild.id);
    if (atualizacaoAnterior) clearTimeout(atualizacaoAnterior);

    atualizacoesContadorBoosters.set(guild.id, setTimeout(() => {
        atualizacoesContadorBoosters.delete(guild.id);
        atualizarContadorBoosters(guild);
    }, 1000));
}

async function garantirCargoNovoMembro(member) {
    if (member.user.bot || member.roles.cache.has(CARGO_NOVO_MEMBRO_ID)) return true;

    const cargo = await member.guild.roles.fetch(CARGO_NOVO_MEMBRO_ID).catch(() => null);
    const membroBot = member.guild.members.me || await member.guild.members.fetch(client.user.id).catch(() => null);
    if (!cargo) {
        console.error(`[boas-vindas] Cargo de membro não encontrado: ${CARGO_NOVO_MEMBRO_ID}`);
        return false;
    }
    if (!membroBot?.permissions.has('ManageRoles') || !cargo.editable) {
        console.error(`[boas-vindas] Não é possível atribuir o cargo ${cargo.name} (${cargo.id}). Verifique Manage Roles e se o cargo está abaixo do cargo mais alto do bot.`);
        return false;
    }

    try {
        await member.roles.add(cargo, 'Cargo automático para novos membros');
        console.log(`[boas-vindas] Cargo ${cargo.name} atribuído a ${member.user.tag}.`);
        return true;
    } catch (error) {
        console.error(`[boas-vindas] Erro ao adicionar cargo de novo membro a ${member.user.tag}:`, error);
        return false;
    }
}

client.on('guildMemberAdd', async member => {
    if (jaProcessadoRecentemente(`boasvindas_${member.guild.id}_${member.id}`)) return;

    await garantirCargoNovoMembro(member);

    try {
        const canalBoasVindas = await member.guild.channels.fetch(CANAL_BOAS_VINDAS_ID).catch(() => null);
        if (!canalBoasVindas?.isTextBased()) {
            console.error(`[boas-vindas] Canal específico não encontrado ou não é textual: ${CANAL_BOAS_VINDAS_ID}`);
        } else {
            const emoji1 = tagDoEmoji(EMOJI_1_ID);
            const emoji3 = tagDoEmoji(EMOJI_3_ID);
            const embedBoasVindas = new EmbedBuilder()
                .setColor(COR_BOAS_VINDAS)
                .setTitle('Seja Bem-vindo(a)!')
                .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 256 }))
                .addFields(
                    {
                        name: `${emoji1} Sabia que...`,
                        value: `Você é o **${member.guild.memberCount}º** membro aqui no servidor?`
                    },
                    {
                        name: '<:denuncia:SEU_ID_DISCORD> Evite punições!',
                        value: linkDoCanal('Leia as Regras', CANAL_REGRAS_ID, member.guild.id)
                    },
                    {
                        name: `${emoji3} Dúvidas?`,
                        value: `Fale com a Moderação no ${linkDoCanal('Chat de Suporte', CANAL_SUPORTE_ID, member.guild.id)}`
                    },
                    {
                        name: '<:cargos:SEU_ID_DISCORD> Cargos',
                        value: `Passe no ${linkDoCanal('Chat de Cargos', CANAL_CARGOS_ID, member.guild.id)} para pegar os seus!`
                    }
                )
                .setFooter({ text: `${member.user.tag} (${member.id})` });

            await canalBoasVindas.send({
                content: `Olá <@${member.id}> 👋`,
                embeds: [embedBoasVindas],
                allowedMentions: { users: [member.id] }
            });
        }
    } catch (error) {
        console.error('[boas-vindas] Erro ao enviar mensagem no canal específico:', error);
    }

    try {
        const canalChat = await member.guild.channels.fetch(CANAL_CHAT_NOVO_MEMBRO_ID).catch(() => null);
        if (!canalChat?.isTextBased()) {
            console.error(`[boas-vindas] Canal de chat não encontrado ou não é textual: ${CANAL_CHAT_NOVO_MEMBRO_ID}`);
        } else {
            await canalChat.send({
                content: `<@${member.id}> Bem-vindo(a) ao servidor!`,
                allowedMentions: { users: [member.id] }
            });
        }
    } catch (error) {
        console.error('[boas-vindas] Erro ao enviar mensagem no canal de chat:', error);
    }
});

client.on('guildMemberUpdate', async (membroAntigo, membroNovo) => {
    if (membroNovo.user.bot || membroNovo.roles.cache.has(CARGO_NOVO_MEMBRO_ID)) return;
    if (membroAntigo.pending === membroNovo.pending && membroNovo.pending !== false) return;
    await garantirCargoNovoMembro(membroNovo);
});

client.on('guildMemberUpdate', (membroAntigo, membroNovo) => {
    const tinhaCargo = membroAntigo.roles.cache.has(CARGO_BOOSTER_ID);
    const temCargo = membroNovo.roles.cache.has(CARGO_BOOSTER_ID);
    if (tinhaCargo !== temCargo) agendarAtualizacaoContadorBoosters(membroNovo.guild);
});

if (!USAR_EVENTOS_MODULARES) {
    client.on('guildMemberAdd', member => agendarAtualizacaoContadorBoosters(member.guild));
    client.on('guildMemberRemove', member => agendarAtualizacaoContadorBoosters(member.guild));
}

const PUNICOES_REGISTRADAS_RECENTEMENTE = new Map();
const BANIMENTOS_APROVADOS_PELO_BOT = new Set();
const SOLICITACOES_BANIMENTO_PENDENTES = new Set();

// Formata a duração de um castigo.
function formatarDuracaoTimeout(membro, entrada) {
    const alteracao = entrada.changes?.find(change => change.key === 'communication_disabled_until');
    const fimTimeout = alteracao?.new ? new Date(alteracao.new) : membro?.communicationDisabledUntil;
    if (!fimTimeout || Number.isNaN(fimTimeout.getTime())) return 'Não informado';

    const minutos = Math.max(1, Math.ceil((fimTimeout.getTime() - Date.now()) / 60000));
    if (minutos < 60) return `${minutos} minuto(s)`;
    const horas = Math.ceil(minutos / 60);
    if (horas < 24) return `${horas} hora(s)`;
    return `${Math.ceil(horas / 24)} dia(s)`;
}

async function enviarPunicaoPorPrivado(entrada, guild, dadosComando = {}) {
    const usuarioId = entrada.targetId;
    const usuario = await client.users.fetch(usuarioId).catch(() => null);
    if (!usuario) return;

    const membro = await guild.members.fetch(usuarioId).catch(() => null);
    const motivo = dadosComando.motivo || entrada.reason || 'Não informado';
    const duracao = entrada.action === AuditLogEvent.MemberBanAdd
        ? 'banimento permanente'
        : formatarDuracaoTimeout(membro, entrada);

    const mensagem = [
        `Você levou uma penalidade no servidor **seu servidor** de **${duracao}**.`,
        '',
        'Motivo segundo nossa equipe staff:',
        `\`${motivo}\``,
        '',
        'Esperamos que isso não se repita novamente.',
        '',
        '> Acha que nos cometemos um erro?',
        '> Entre em contato com nossos administradores no privado:',
        '> Admin 1 - `SEU_ID_USUARIO_ADMIN_1`',
        '> Admin 2 - `SEU_ID_USUARIO_ADMIN_2`'
    ].join('\n');

    const embed = new EmbedBuilder()
        .setColor(COR_PENALIDADE)
        .setTitle('⚠️ Penalidade aplicada')
        .setDescription(mensagem)
        .setTimestamp();

    try {
        await usuario.send({ embeds: [embed] });
    } catch (error) {
        console.warn(`[punições] Não foi possível enviar DM para ${usuarioId}:`, error?.message || error);
    }
}

// Envia o registro de uma punição para o canal de moderação.
async function registrarPunicao(entrada, guild, dadosComando = {}) {
    const ehBan = entrada.action === AuditLogEvent.MemberBanAdd;
    const canal = await guild.channels.fetch(ehBan ? CANAL_LOG_BANS_ID : CANAL_LOG_PUNICOES_ID).catch(() => null);
    if (!canal) {
        console.error('[punições] Canal de punições não encontrado.');
        return;
    }

    const membro = ehBan ? null : await guild.members.fetch(entrada.targetId).catch(() => null);
    const tipo = ehBan ? 'Banimento' : 'Castigo (timeout)';
    const duracao = ehBan ? 'Permanente' : formatarDuracaoTimeout(membro, entrada);
    const chaveRecente = `${guild.id}_${entrada.targetId}_${ehBan ? 'ban' : 'timeout'}`;
    const ultimaRegistro = PUNICOES_REGISTRADAS_RECENTEMENTE.get(chaveRecente);
    if (ultimaRegistro && Date.now() - ultimaRegistro < 10000) return;
    PUNICOES_REGISTRADAS_RECENTEMENTE.set(chaveRecente, Date.now());
    for (const [chave, timestamp] of PUNICOES_REGISTRADAS_RECENTEMENTE) {
        if (Date.now() - timestamp >= 10000) PUNICOES_REGISTRADAS_RECENTEMENTE.delete(chave);
    }

    const componentes = [
        new ButtonBuilder()
            .setCustomId(ehBan ? `punicao_aceitar_ban_${entrada.targetId}` : `punicao_aceitar_${entrada.targetId}`)
            .setLabel(ehBan ? 'Aceitar ban' : 'Aceitar')
            .setEmoji({ name: 'acept', id: 'SEU_ID_DISCORD' })
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`punicao_recusar_${ehBan ? 'ban' : 'timeout'}_${entrada.targetId}`)
            .setLabel(ehBan ? 'Recusar ban' : 'Recusar')
            .setEmoji({ name: 'recuse', id: 'SEU_ID_DISCORD' })
            .setStyle(ButtonStyle.Secondary)
    ];
    if (!ehBan) {
        componentes.push(new ButtonBuilder()
            .setCustomId(`punicao_mudar_tempo_${entrada.targetId}`)
            .setLabel('Mudar tempo')
            .setEmoji({ name: 'engrenagem', id: 'SEU_ID_DISCORD' })
            .setStyle(ButtonStyle.Secondary));
        componentes.push(new ButtonBuilder()
            .setCustomId(`punicao_pedir_ban_${entrada.targetId}`)
            .setLabel('Pedir banimento')
            .setEmoji({ name: 'mega_fone', id: 'SEU_ID_DISCORD' })
            .setStyle(ButtonStyle.Secondary));
    }

    const mensagem = await canal.send({
        content: `<@&${CARGO_MARCAR_PUNICOES_ID}>\n**${tipo} registrado**`,
        allowedMentions: { roles: [CARGO_MARCAR_PUNICOES_ID] },
        embeds: [new EmbedBuilder()
            .setColor(0x95A5A6)
            .setTitle(`${ehBan ? '🔨' : '⏳'} ${tipo}`)
            .addFields(
                { name: 'Quem aplicou', value: dadosComando.executor ? `${dadosComando.executor} (${dadosComando.executor.tag})` : entrada.executor ? `${entrada.executor} (${entrada.executor.tag})` : 'Desconhecido', inline: true },
                { name: 'Usuário punido', value: ehBan ? entrada.targetId : `<@${entrada.targetId}> (${entrada.targetId})`, inline: true },
                { name: 'Duração', value: duracao, inline: true },
                { name: 'Motivo', value: dadosComando.motivo || entrada.reason || 'Não informado' }
            )
            .setTimestamp()],
        components: [new ActionRowBuilder().addComponents(componentes)]
    });

    await enviarPunicaoPorPrivado(entrada, guild, dadosComando).catch(error => console.warn('[punições] Falha ao enviar DM:', error?.message || error));

    try {
        const topico = await mensagem.startThread({
            name: `${tipo} - ${entrada.targetId}`,
            autoArchiveDuration: 10080,
            reason: `Discussão sobre ${tipo.toLowerCase()}`
        });
        if (!ehBan) {
            await topico.send({
                content: `<@&${CARGO_MARCAR_PUNICOES_ID}>\n${dadosComando.executor ? `${dadosComando.executor} aplicou este castigo em <@${entrada.targetId}>.` : `<@${entrada.targetId}> recebeu este castigo.`}`,
                allowedMentions: { roles: [CARGO_MARCAR_PUNICOES_ID], users: [entrada.targetId] },
                embeds: [new EmbedBuilder()
                    .setColor(0x95A5A6)
                    .setTitle('⏳ Castigo aplicado')
                    .setDescription(`Usuário punido: <@${entrada.targetId}>\nAplicado por: ${dadosComando.executor || 'Desconhecido'}\nDuração: **${duracao}**\nMotivo: ${dadosComando.motivo || entrada.reason || 'Não informado'}`)
                    .setTimestamp()],
                components: [new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`punicao_mudar_tempo_${entrada.targetId}`)
                        .setLabel('Mudar tempo')
                        .setEmoji({ name: 'engrenagem', id: 'SEU_ID_DISCORD' })
                        .setStyle(ButtonStyle.Secondary)
                )]
            });
        }
    } catch (error) {
        console.error('[punições] Erro ao criar tópico:', error);
    }
}

// Detecta punições feitas fora dos comandos do bot.
client.on('guildAuditLogEntryCreate', async (entrada, guild) => {
    try {
        const ehBan = entrada.action === AuditLogEvent.MemberBanAdd;
        if (ehBan && BANIMENTOS_APROVADOS_PELO_BOT.delete(`${guild.id}_${entrada.targetId}`)) return;
        const ehTimeout = entrada.action === AuditLogEvent.MemberUpdate &&
            entrada.changes?.some(change => change.key === 'communication_disabled_until' && change.new);
        if (!ehBan && !ehTimeout) return;
        await registrarPunicao(entrada, guild);
    } catch (error) {
        console.error('[punições] Erro ao registrar punição:', error);
    }
});

const { commands } = require('../features/commands');

// Monta a marcação de um emoji personalizado.
function tagDoEmoji(id) {
    const emoji = obterEmoji(id);
    if (!emoji) return '';
    return `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
}

// Busca um emoji no servidor ou na aplicação.
function obterEmoji(id) {
    let emoji = client.emojis.cache.get(id);
    if (!emoji) emoji = client.application.emojis.cache.get(id);

    if (!emoji) {
        console.error(`Emoji com ID ${id} não encontrado (nem em servidores nem na aplicação). Verifique se o ID está certo e se o bot está no servidor dono do emoji.`);
        return null;
    }

    return emoji;
}

const topicosAbertosPorUsuario = new Map();
const dadosDosTopicos = new Map();

function componentesTicketAguardando() {
    return [new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('ticket_assumir')
            .setLabel('Assumir ticket')
            .setEmoji({ name: 'acept', id: EMOJI_ASSUMIR_TICKET_ID })
            .setStyle(ButtonStyle.Primary)
    )];
}

function componentesTicketAssumido() {
    return [new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('ticket_fechar')
            .setLabel('Fechar ticket')
            .setEmoji({ name: 'recuse', id: EMOJI_FECHAR_TICKET_ID })
            .setStyle(ButtonStyle.Danger)
    )];
}

function registrarDadosDoTopico(topico, usuario) {
    dadosDosTopicos.set(topico.id, {
        usuarioId: usuario.id,
        usuarioTag: usuario.tag,
        criadoEm: Date.now()
    });
}

async function avisarTicketAssumido(dados, atendente) {
    if (!dados.usuarioId) return;

    try {
        const usuario = await client.users.fetch(dados.usuarioId);
        await usuario.send(`✅ Seu ticket foi assumido por ${atendente}.`);
    } catch (error) {
        console.error('[tickets] Não foi possível enviar o aviso por DM:', error);
    }
}

async function avisarTicketFechado(dados, responsavel) {
    if (!dados.usuarioId) return;

    try {
        const usuario = await client.users.fetch(dados.usuarioId);
        await usuario.send(`✅ Seu ticket foi fechado por ${responsavel}.`);
    } catch (error) {
        console.error('[tickets] Não foi possível enviar o aviso de fechamento por DM:', error);
    }
}

function obterDadosTicket(interaction) {
    const dadosSalvos = dadosDosTopicos.get(interaction.channel.id) || {};
    const conteudo = interaction.message?.content || '';
    const mencoes = [...conteudo.matchAll(/<@!?(\d+)>/g)].map(mencao => mencao[1]);
    const mencaoResponsavel = conteudo.match(/Assumido por\s+<@!?(\d+)>/);
    return {
        ...dadosSalvos,
        usuarioId: dadosSalvos.usuarioId || mencoes[0],
        assumidoPorId: dadosSalvos.assumidoPorId || mencaoResponsavel?.[1]
    };
}

async function registrarEFecharTopico(interaction) {
    const topico = interaction.channel;
    const dados = obterDadosTicket(interaction);
    const canalLog = await topico.guild.channels.fetch(CANAL_LOG_TICKETS_ID).catch(() => null);
    const fechadoEm = new Date();

    if (canalLog) {
        try {
            const embedLog = new EmbedBuilder()
                .setColor(COR_LOG_CALL_SAIU)
                .setTitle('Ticket fechado')
                .addFields(
                    { name: 'Tópico', value: topico.name, inline: true },
                    { name: 'Canal', value: topico.parent ? `${topico.parent}` : 'Canal desconhecido', inline: true },
                    { name: 'Aberto por', value: dados.usuarioId ? `<@${dados.usuarioId}>` : 'Não identificado', inline: true },
                    { name: 'Assumido por', value: dados.assumidoPorId ? `<@${dados.assumidoPorId}>` : 'Não identificado', inline: true },
                    { name: 'Fechado por', value: `${interaction.user}`, inline: true },
                    { name: 'Fechado em', value: `<t:${Math.floor(fechadoEm.getTime() / 1000)}:F>`, inline: true }
                )
                .setTimestamp(fechadoEm);
            await canalLog.send({ embeds: [embedLog] });
        } catch (error) {
            console.error('[tickets] Erro ao enviar log de fechamento:', error);
        }
    } else {
        console.error(`Canal de log de tickets (${CANAL_LOG_TICKETS_ID}) não encontrado.`);
    }

    await topico.setArchived(true, `Ticket fechado por ${interaction.user.tag}`);
    await avisarTicketFechado(dados, interaction.user);
    dadosDosTopicos.delete(topico.id);
}

// Verifica se o usuário já possui um tópico aberto.
async function usuarioJaTemTopicoAberto(canal, usuario) {
    const chave = `${canal.id}_${usuario.id}`;

    const idSalvo = topicosAbertosPorUsuario.get(chave);
    if (idSalvo) {
        try {
            const topicoSalvo = await canal.threads.fetch(idSalvo);
            if (topicoSalvo && !topicoSalvo.archived) return topicoSalvo;
        } catch (erro) {
        }
        topicosAbertosPorUsuario.delete(chave);
    }

    const ativos = await canal.threads.fetchActive();
    const encontrado = ativos.threads.find(topico => topico.name === usuario.username && !topico.archived);
    if (encontrado) topicosAbertosPorUsuario.set(chave, encontrado.id);
    return encontrado ?? null;
}

// Guarda um tópico aberto para evitar duplicidade.
function registrarTopicoAberto(canal, usuario, topico) {
    topicosAbertosPorUsuario.set(`${canal.id}_${usuario.id}`, topico.id);
}

// Monta a descrição dos cargos disponíveis na loja.
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

function montarConfiguracaoBeneficios(guildId, usuarioId) {
    const compras = estadoCompras[guildId]?.[usuarioId] || {};
    const vmutesPorDuracao = new Map([
        ['1 hora', 0],
        ['1 dia', 0],
        ['2 dias', 0]
    ]);
    for (const cargo of obterCargosVipDoUsuario(guildId, usuarioId)) {
        const beneficios = obterBeneficiosUsuario(guildId, usuarioId, cargo);
        for (const vmute of beneficios.vmutes) {
            vmutesPorDuracao.set(
                vmute.duracao,
                (vmutesPorDuracao.get(vmute.duracao) || 0) + vmute.restante
            );
        }
    }

    const linhasVmute = [...vmutesPorDuracao.entries()]
        .map(([duracao, restante]) => `• VMute de ${duracao}: **${restante} restante(s)**`)
        .join('\n');

    const totais = obterSaldosConfiguracao(guildId, usuarioId);
    return `• Cargos personalizados: **${totais.cargos} restante(s)**\n• Calls personalizadas: **${totais.calls} restante(s)**\n${linhasVmute}`;
}

function montarEmbedConfiguracao(guildId, usuarioId) {
    const compras = estadoCompras[guildId]?.[usuarioId] || {};
    const cargosAtivos = obterCargosVipDoUsuario(guildId, usuarioId);
    const validade = cargosAtivos.length
        ? cargosAtivos.map(cargo => compras[cargo.id]
            ? `<@&${cargo.id}> • restante: <t:${Math.floor(compras[cargo.id] / 1000)}:R>`
            : `<@&${cargo.id}> • validade não registrada`
        ).join('\n')
        : 'Nenhum cargo comprado ativo.';
    const cargosPersonalizados = listarCargosPersonalizados(guildId, usuarioId);
    const callsPersonalizadas = listarCallsPersonalizadas(guildId, usuarioId);

    return new EmbedBuilder()
        .setColor(COR_LOJA)
        .setTitle('Sua configuração')
        .addFields(
            { name: 'Cargos VIP ativos', value: validade },
            { name: 'Benefícios restantes', value: montarConfiguracaoBeneficios(guildId, usuarioId).slice(0, 1024) },
            { name: 'Seus cargos personalizados', value: cargosPersonalizados.length ? cargosPersonalizados.map(item => `<@&${item.roleId}>`).join(' ') : 'Nenhum' },
            { name: 'Suas calls personalizadas', value: callsPersonalizadas.length ? callsPersonalizadas.map(item => `<#${item.channelId}>`).join(' ') : 'Nenhuma' }
        );
}

function obterSaldosConfiguracao(guildId, usuarioId) {
    return obterCargosVipDoUsuario(guildId, usuarioId)
        .reduce((saldo, cargo) => {
            const beneficios = obterBeneficiosUsuario(guildId, usuarioId, cargo);
            saldo.cargos += beneficios.cargosPersonalizados;
            saldo.calls += beneficios.callsPersonalizadas;
            saldo.vmutes += beneficios.vmutes.reduce((total, vmute) => total + vmute.restante, 0);
            return saldo;
        }, { cargos: 0, calls: 0, vmutes: 0 });
}

function obterCargosVipDoUsuario(guildId, usuarioId) {
    const compras = estadoCompras[guildId]?.[usuarioId] || {};
    const membro = client.guilds.cache.get(guildId)?.members.cache.get(usuarioId);
    const agora = Date.now();
    return CARGOS_LOJA.filter(cargo =>
        membro?.roles.cache.has(cargo.id) && (!compras[cargo.id] || compras[cargo.id] > agora)
    );
}

function montarComponentesConfiguracao(guildId, usuarioId) {
    const saldos = obterSaldosConfiguracao(guildId, usuarioId);
    const cargosCriados = listarCargosPersonalizados(guildId, usuarioId).length;
    const callsCriadas = listarCallsPersonalizadas(guildId, usuarioId).length;
    return [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('config_criarcargo').setLabel(`Criar cargo (${saldos.cargos})`).setStyle(ButtonStyle.Secondary).setDisabled(saldos.cargos === 0),
            new ButtonBuilder().setCustomId('config_criarcall').setLabel(`Criar call (${saldos.calls})`).setStyle(ButtonStyle.Secondary).setDisabled(saldos.calls === 0),
            new ButtonBuilder().setCustomId('config_darcargo').setLabel(`Entregar cargo (${cargosCriados})`).setStyle(ButtonStyle.Secondary).setDisabled(cargosCriados === 0),
            new ButtonBuilder().setCustomId('config_addcall').setLabel(`Adicionar à call (${callsCriadas})`).setStyle(ButtonStyle.Secondary).setDisabled(callsCriadas === 0),
            new ButtonBuilder().setCustomId('config_vmute').setLabel(`Aplicar VMute (${saldos.vmutes})`).setStyle(ButtonStyle.Secondary).setDisabled(saldos.vmutes === 0)
        )
    ];
}

async function atualizarConfiguracao(interaction) {
    if (!interaction.message?.edit) return;
    await interaction.message.edit({
        embeds: [montarEmbedConfiguracao(interaction.guild.id, interaction.user.id)],
        components: montarComponentesConfiguracao(interaction.guild.id, interaction.user.id)
    }).catch(() => {});
}

const usuariosCriandoTopico = new Set();

// Monta o embed do campeonato.
function montarEmbedCampeonato(estado, guildId) {
    const emojiMoeda = tagDoEmoji(EMOJI_BOTAO_COMPRAR_ID);
    const emojiSolo = tagDoEmoji(EMOJI_BOTAO_SOLO_ID);
    const emojiEquipe = tagDoEmoji(EMOJI_BOTAO_EQUIPE_ID);
    const emojiInfo = tagDoEmoji(EMOJI_CAMPEONATO_INFO_ID);

    const linkOficializar = linkDoCanal('oficializado', CANAL_OFICIALIZAR_ID, guildId);

    return new EmbedBuilder()
        .setColor(COR_CAMPEONATO)
        .setDescription(
            `# __CAMPEONATO__\n` +
            `## • Como Funciona\n` +
            `* ${emojiInfo} Os campeonatos acontecem toda vez que a quantidade mínima de pessoas fecha\n` +
            `* ${emojiSolo} Entrando Solo, sua equipe será sorteada\n` +
            `* ${emojiEquipe} Entrando com Time, seu time precisa estar ${linkOficializar}\n\n` +
            `## • Preços\n` +
            `${emojiMoeda} 5$ a inscrição Solo\n\n` +
            `${emojiSolo} Campeonato Solo: **${estado.solo}/${LIMITE_INSCRICOES_SOLO}**\n` +
            `${emojiEquipe} Campeonato Equipe: **${estado.equipe}/${LIMITE_INSCRICOES_EQUIPE}**\n` +
            `\u200b`
        )
        .setImage('attachment://banner_champion.jpg');
}

// Inicializa comandos, emojis e sessões de voz.
client.once('clientReady', async () => {
    console.log(`Bot conectado como ${client.user.tag}`);

    try {
        await client.application.commands.set(commands);
        console.log(`${commands.length} comandos registrados.`);
    } catch (error) {
        console.error('[comandos] Erro ao registrar comandos:', error);
    }

    try {
        await client.application.emojis.fetch();
    } catch (error) {
        console.error('[emoji] Erro ao carregar emojis da aplicação:', error);
    }

    try {
        await entrarNaCallAutomatica();
    } catch (error) {
        console.error('[voz] Erro ao entrar na call automática:', error);
    }

    const sessoesReconhecidas = new Set();
    for (const guild of client.guilds.cache.values()) {
        for (const estadoDeVoz of guild.voiceStates.cache.values()) {
            if (estadoDeVoz.channelId && !estadoDeVoz.member?.user.bot) {
                const sessaoSalva = estadoSessoesVoz[estadoDeVoz.id];
                const sessao = sessaoSalva?.guildId === guild.id && sessaoSalva.canalId === estadoDeVoz.channelId
                    ? sessaoSalva
                    : { inicio: Date.now(), canalId: estadoDeVoz.channelId, guildId: guild.id };
                sessoesDeVoz.set(estadoDeVoz.id, sessao);
                estadoSessoesVoz[estadoDeVoz.id] = sessao;
                sessoesReconhecidas.add(`${guild.id}_${estadoDeVoz.id}`);
            }
        }
    }

    for (const [usuarioId, sessao] of Object.entries(estadoSessoesVoz)) {
        if (sessoesReconhecidas.has(`${sessao.guildId}_${usuarioId}`)) continue;
        // Sem um evento de saída, não é possível saber quando a sessão terminou.
        // Descartar a sessão evita pagar horas de um período em que o bot estava desligado.
        delete estadoSessoesVoz[usuarioId];
    }
    await removerCargosExpirados();
    await sincronizarCargosVip(false);
    for (const guild of client.guilds.cache.values()) {
        agendarAtualizacaoContadorBoosters(guild);
    }
    setInterval(() => {
        salvarTempoSessoesVoz();
        removerCargosExpirados();
        sincronizarCargosVip();
        for (const guild of client.guilds.cache.values()) {
            const mensagensNovas = obterTotaisServidor(guild.id).mensagens;
            const mensagensAntigas = ultimosTotaisMensagensExibidos.get(guild.id) ?? mensagensNovas;
            console.log(`[mensagens] Mensagens totais guardadas: ${mensagensAntigas} > ${mensagensNovas}`);
            ultimosTotaisMensagensExibidos.set(guild.id, mensagensNovas);

            const pessoasEmCall = guild.voiceStates.cache.filter(estado =>
                estado.channelId && !estado.member?.user.bot
            ).size;
            console.log(`[voz] Pessoas em call: ${pessoasEmCall}`);
        }
        for (const [usuarioId, sessao] of sessoesDeVoz) {
            const guild = client.guilds.cache.get(sessao.guildId);
            const canal = guild?.channels.cache.get(sessao.canalId);
            if (guild) verificarRecompensaCall(guild, usuarioId, canal);
        }
    }, 60 * 1000);
    salvarEstadoPerfis();

});

if (!USAR_EVENTOS_MODULARES) {

// Processa comandos, botões e menus.
client.on('interactionCreate', async interaction => {
    try {
    if (interaction.isButton() && interaction.customId.startsWith('status_')) {
        const partes = interaction.customId.split('_');
        const tipoBotao = partes[1];

        try {
            await interaction.deferUpdate();
            if (tipoBotao === 'categoria' && ['call', 'chat', 'gemas'].includes(partes[2])) {
                const categoria = partes[2];
                await interaction.editReply({
                    embeds: [await montarEmbedStatus(interaction.guild, categoria)],
                    components: montarComponentesStatus(categoria)
                });
            } else if (tipoBotao === 'periodo' && ['call', 'chat', 'gemas'].includes(partes[2])) {
                await interaction.editReply({
                    embeds: [await montarEmbedStatus(interaction.guild, partes[2])],
                    components: montarComponentesStatus(partes[2])
                });
            }
        } catch (error) {
            console.error('[status] Erro ao trocar período:', error);
        }
        return;
    }

    if (interaction.isButton() && ['ticket_assumir', 'ticket_fechar'].includes(interaction.customId)) {
        if (!interaction.channel?.isThread()) return;

        try {
            if (interaction.customId === 'ticket_assumir') {
                const podeAssumir = interaction.member?.roles.cache.some(cargo =>
                    CARGOS_AUTORIZADOS_ASSUMIR_TICKET.has(cargo.id)
                );
                if (!podeAssumir) {
                    await interaction.reply({ content: '❌ Apenas Owner e Sub Owner podem assumir tickets.', flags: MessageFlags.Ephemeral });
                    return;
                }

                const conteudoAtual = interaction.message.content || '';
                const textoAssumido = conteudoAtual.includes('Assumido por')
                    ? conteudoAtual
                    : `${conteudoAtual}\n\n✅ Assumido por ${interaction.user}`;
                const dados = dadosDosTopicos.get(interaction.channel.id) || {};
                dados.assumidoPorId = interaction.user.id;
                dados.assumidoPorTag = interaction.user.tag;
                dadosDosTopicos.set(interaction.channel.id, dados);
                await interaction.update({
                    content: textoAssumido,
                    components: componentesTicketAssumido()
                });
                await avisarTicketAssumido(dados, interaction.user);
            } else {
                const dados = obterDadosTicket(interaction);
                if (!dados.assumidoPorId || dados.assumidoPorId !== interaction.user.id) {
                    await interaction.reply({ content: '❌ Apenas quem assumiu este ticket pode fechá-lo.', flags: MessageFlags.Ephemeral });
                    return;
                }
                await interaction.deferUpdate();
                await registrarEFecharTopico(interaction);
            }
        } catch (error) {
            console.error('[tickets] Erro ao processar botão:', error);
            if (interaction.deferred || interaction.replied) {
                await interaction.followUp({ content: '❌ Não foi possível processar o ticket.', flags: MessageFlags.Ephemeral }).catch(() => {});
            } else {
                await interaction.reply({ content: '❌ Não foi possível processar o ticket.', flags: MessageFlags.Ephemeral }).catch(() => {});
            }
        }
        return;
    }

    if (interaction.isButton() && interaction.customId.startsWith('punicao_mudar_tempo_')) {
        const podeAlterar = interaction.member?.roles.cache.some(cargo =>
            CARGOS_AUTORIZADOS_DECISAO_PUNICAO.has(cargo.id)
        );
        if (!podeAlterar) {
            await interaction.reply({ content: '❌ Você não tem permissão para mudar o tempo deste castigo.', flags: MessageFlags.Ephemeral });
            return;
        }

        const usuarioId = interaction.customId.replace('punicao_mudar_tempo_', '');
        const modal = new ModalBuilder()
            .setCustomId(`punicao_modal_tempo_${usuarioId}_${interaction.message.id}`)
            .setTitle('Mudar tempo do castigo')
            .addComponents(new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('tempo')
                    .setLabel('Novo tempo em minutos')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Ex.: 60')
                    .setRequired(true)
                    .setMinLength(1)
                    .setMaxLength(5)
            ));
        await interaction.showModal(modal);
        return;
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('punicao_modal_tempo_')) {
        const podeAlterar = interaction.member?.roles.cache.some(cargo =>
            CARGOS_AUTORIZADOS_DECISAO_PUNICAO.has(cargo.id)
        );
        if (!podeAlterar) {
            await interaction.reply({ content: '❌ Você não tem permissão para mudar o tempo deste castigo.', flags: MessageFlags.Ephemeral });
            return;
        }

        const dadosModal = interaction.customId.match(/^punicao_modal_tempo_(\d+)_(\d+)$/);
        const usuarioId = dadosModal?.[1] || interaction.customId.replace('punicao_modal_tempo_', '');
        const mensagemOrigemId = dadosModal?.[2];
        const tempo = Number(interaction.fields.getTextInputValue('tempo'));
        if (!Number.isInteger(tempo) || tempo < 1 || tempo > 40320) {
            await interaction.reply({ content: '❌ Informe um tempo inteiro entre 1 e 40320 minutos.', flags: MessageFlags.Ephemeral });
            return;
        }

        const membro = await interaction.guild.members.fetch(usuarioId).catch(() => null);
        if (!membro || !membro.moderatable) {
            await interaction.reply({ content: '❌ Não foi possível alterar o castigo desse usuário.', flags: MessageFlags.Ephemeral });
            return;
        }

        try {
            await membro.timeout(tempo * 60 * 1000, `Tempo alterado por ${interaction.user.tag}`);
            const duracao = `${tempo} minuto(s)`;
            const canalPunicoes = await interaction.guild.channels.fetch(CANAL_LOG_PUNICOES_ID).catch(() => null);
            const mensagemOrigem = mensagemOrigemId
                ? await canalPunicoes?.messages.fetch(mensagemOrigemId).catch(() => null)
                : null;
            const duracaoAnterior = mensagemOrigem?.embeds[0]?.fields?.find(campo => campo.name === 'Duração')?.value || 'Não informado';
            const mensagemPrincipal = interaction.channel.isThread()
                ? await interaction.channel.fetchStarterMessage().catch(() => null)
                : mensagemOrigem;
            const mensagensAtualizar = new Set([mensagemOrigem, mensagemPrincipal].filter(Boolean));
            const thread = interaction.channel.isThread() ? interaction.channel : mensagemOrigem?.thread;
            if (thread) {
                const mensagensDoTopico = await thread.messages.fetch({ limit: 50 }).catch(() => null);
                for (const mensagem of mensagensDoTopico?.values() || []) {
                    if (mensagem.components.some(linha => linha.components.some(componente =>
                        componente.customId === `punicao_mudar_tempo_${usuarioId}`
                    ))) mensagensAtualizar.add(mensagem);
                }
            }
            for (const mensagem of mensagensAtualizar) {
                if (!mensagem.embeds[0]) continue;
                const embedAtualizado = EmbedBuilder.from(mensagem.embeds[0]).setColor(0xF1C40F);
                const campos = embedAtualizado.data.fields || [];
                const campoDuracao = campos.find(campo => campo.name === 'Duração');
                if (campoDuracao) campoDuracao.value = duracao;
                const conteudo = mensagem.id === mensagemOrigemId
                    ? `<@&${CARGO_MARCAR_PUNICOES_ID}>\n<@${usuarioId}>\n⏳ Alteração de tempo feita por ${interaction.user}.\nTempo anterior: **${duracaoAnterior}**\nNovo tempo: **${duracao}**`
                    : mensagem.content;
                await mensagem.edit({
                    content: conteudo,
                    embeds: [embedAtualizado],
                    components: [],
                    allowedMentions: { roles: [CARGO_MARCAR_PUNICOES_ID], users: [usuarioId] }
                }).catch(() => {});
            }
            await interaction.reply({ content: `✅ Castigo de <@${usuarioId}> alterado para **${duracao}**.`, flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error('[punições] Erro ao mudar tempo:', error);
            await interaction.reply({ content: '❌ Não foi possível alterar o tempo do castigo.', flags: MessageFlags.Ephemeral });
        }
        return;
    }

    if (interaction.isButton() && interaction.customId.startsWith('punicao_pedir_ban_')) {
        const podeSolicitar = interaction.member?.roles.cache.some(cargo =>
            CARGOS_AUTORIZADOS_DECISAO_PUNICAO.has(cargo.id)
        );
        if (!podeSolicitar) {
            await interaction.reply({ content: '❌ Você não tem permissão para pedir um banimento.', flags: MessageFlags.Ephemeral });
            return;
        }

        const usuarioId = interaction.customId.replace('punicao_pedir_ban_', '');
        const chaveSolicitacao = `${interaction.guild.id}_${usuarioId}`;
        if (SOLICITACOES_BANIMENTO_PENDENTES.has(chaveSolicitacao)) {
            await interaction.reply({ content: '⏳ Já existe uma solicitação de banimento pendente para este usuário.', flags: MessageFlags.Ephemeral });
            return;
        }

        const canalBanimentos = await interaction.guild.channels.fetch(CANAL_LOG_BANS_ID).catch(() => null);
        if (!canalBanimentos) {
            await interaction.reply({ content: '❌ Canal de banimentos não encontrado.', flags: MessageFlags.Ephemeral });
            return;
        }

        const campoMotivo = interaction.message.embeds[0]?.fields?.find(campo => campo.name === 'Motivo');
        SOLICITACOES_BANIMENTO_PENDENTES.add(chaveSolicitacao);
        try {
            await canalBanimentos.send({
                content: `<@&${CARGO_MARCAR_PUNICOES_ID}>\n⏳ Solicitação de banimento enviada por ${interaction.user}.`,
                allowedMentions: { roles: [CARGO_MARCAR_PUNICOES_ID] },
                embeds: [new EmbedBuilder()
                    .setColor(0x95A5A6)
                    .setTitle('🔨 Solicitação de banimento')
                    .addFields(
                        { name: 'Usuário punido', value: usuarioId, inline: true },
                        { name: 'Solicitado por', value: `${interaction.user}`, inline: true },
                        { name: 'Motivo', value: campoMotivo?.value || 'Não informado' }
                    )
                    .setTimestamp()],
                components: [new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`punicao_aceitar_ban_${usuarioId}`)
                        .setLabel('Aceitar ban')
                        .setEmoji({ name: 'acept', id: 'SEU_ID_DISCORD' })
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId(`punicao_recusar_ban_${usuarioId}`)
                        .setLabel('Recusar ban')
                        .setEmoji({ name: 'recuse', id: 'SEU_ID_DISCORD' })
                        .setStyle(ButtonStyle.Secondary)
                )]
            });
            const embedAtualizado = interaction.message.embeds[0]
                ? EmbedBuilder.from(interaction.message.embeds[0]).setColor(0xE74C3C)
                : null;
            await interaction.message.edit({
                content: `<@&${CARGO_MARCAR_PUNICOES_ID}>\n🔨 Pedido de banimento feito.`,
                allowedMentions: { roles: [CARGO_MARCAR_PUNICOES_ID] },
                embeds: embedAtualizado ? [embedAtualizado] : [],
                components: []
            });
            await interaction.reply({ content: '✅ Solicitação de banimento enviada para aprovação.', flags: MessageFlags.Ephemeral });
        } catch (error) {
            SOLICITACOES_BANIMENTO_PENDENTES.delete(chaveSolicitacao);
            console.error('[ban] Erro ao enviar solicitação:', error);
            await interaction.reply({ content: '❌ Não foi possível enviar a solicitação de banimento.', flags: MessageFlags.Ephemeral });
        }
        return;
    }

    if (interaction.isButton() && (interaction.customId.startsWith('punicao_aceitar_ban_') || interaction.customId.startsWith('punicao_recusar_ban_'))) {
        const podeModerar = interaction.member?.roles.cache.some(cargo =>
            CARGOS_AUTORIZADOS_DECISAO_PUNICAO.has(cargo.id)
        );
        if (!podeModerar) {
            await interaction.reply({ content: '❌ Você não tem permissão para decidir sobre banimentos.', flags: MessageFlags.Ephemeral });
            return;
        }

        const aceitar = interaction.customId.startsWith('punicao_aceitar_ban_');
        const usuarioId = interaction.customId.replace(aceitar ? 'punicao_aceitar_ban_' : 'punicao_recusar_ban_', '');
        try {
            if (aceitar) {
                const membro = await interaction.guild.members.fetch(usuarioId).catch(() => null);
                if (membro && !membro.bannable) {
                    await interaction.reply({ content: '❌ Não consigo banir esse usuário por causa da hierarquia de cargos.', flags: MessageFlags.Ephemeral });
                    return;
                }
                BANIMENTOS_APROVADOS_PELO_BOT.add(`${interaction.guild.id}_${usuarioId}`);
                await interaction.guild.members.ban(usuarioId, { reason: `Ban aprovado por ${interaction.user.tag}` });
                SOLICITACOES_BANIMENTO_PENDENTES.delete(`${interaction.guild.id}_${usuarioId}`);
                const embedAceito = interaction.message.embeds[0]
                    ? EmbedBuilder.from(interaction.message.embeds[0]).setColor(0x2ECC71)
                    : null;
                await interaction.update({
                    content: `<@&${CARGO_MARCAR_PUNICOES_ID}>\n✅ Banimento aceito por ${interaction.user}. Usuário ${usuarioId} foi banido.`,
                    allowedMentions: { roles: [CARGO_MARCAR_PUNICOES_ID] },
                    embeds: embedAceito ? [embedAceito] : [],
                    components: []
                });
            } else {
                SOLICITACOES_BANIMENTO_PENDENTES.delete(`${interaction.guild.id}_${usuarioId}`);
                const embedRecusado = interaction.message.embeds[0]
                    ? EmbedBuilder.from(interaction.message.embeds[0]).setColor(0xE74C3C)
                    : null;
                await interaction.update({
                    content: `<@&${CARGO_MARCAR_PUNICOES_ID}>\n❌ Banimento recusado por ${interaction.user}. Nenhuma ação foi realizada.`,
                    allowedMentions: { roles: [CARGO_MARCAR_PUNICOES_ID] },
                    embeds: embedRecusado ? [embedRecusado] : [],
                    components: []
                });
            }
        } catch (error) {
            BANIMENTOS_APROVADOS_PELO_BOT.delete(`${interaction.guild.id}_${usuarioId}`);
            console.error('[ban] Erro ao decidir solicitação:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: '❌ Não foi possível processar esta solicitação de ban.', flags: MessageFlags.Ephemeral }).catch(() => {});
            }
        }
        return;
    }

    if (interaction.isChatInputCommand() && !['perfil', 'bau', 'horas', 'msg', 'top', 'doar', 'gema', 'cargovip', 'editarcall', 'buy', 'status'].includes(interaction.commandName)) {
        const fazParteDaEquipe = interaction.member?.roles.cache.some(cargo =>
            CARGOS_EQUIPE.has(cargo.id)
        );
        if (!fazParteDaEquipe) {
            await interaction.reply({ content: 'Você precisa ter um cargo da equipe para usar este comando.' });
            setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
            return;
        }
    }

    } catch (error) {
        console.error('[interação] Erro ao processar interação:', error);
        const resposta = { content: '❌ Não foi possível processar este comando. Tente novamente.' };
        if (interaction.deferred || interaction.replied) {
            await interaction.followUp({ ...resposta, flags: MessageFlags.Ephemeral }).catch(() => {});
        } else {
            await interaction.reply({ ...resposta, flags: MessageFlags.Ephemeral }).catch(() => {});
        }
    }
});

}

// Processa comandos, botões e menus.
if (!USAR_EVENTOS_MODULARES) {
client.on('interactionCreate', async interaction => {
    try {
    if (interaction.isChatInputCommand() && interaction.commandName === 'cargovip') {
        const membro = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
        const possuiCargoVip = membro?.roles.cache.some(role => CARGOS_LOJA.some(item => item.id === role.id));
        if (!possuiCargoVip) {
            await interaction.reply({
                content: '❌ Você não possui nenhum cargo VIP ativo para visualizar esta configuração.',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        await interaction.reply({
            embeds: [montarEmbedConfiguracao(interaction.guild.id, interaction.user.id)],
            components: montarComponentesConfiguracao(interaction.guild.id, interaction.user.id),
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    if (interaction.isButton() && interaction.customId.startsWith('config_')) {
        const tipo = interaction.customId.replace('config_', '');
        const configuracoes = {
            criarcargo: ['Criar cargo', [
                ['nome', 'Nome do cargo', TextInputStyle.Short, 100],
                ['cor', 'Cor hexadecimal (#FF0000)', TextInputStyle.Short, 7]
            ]],
            criarcall: ['Criar call', [['nome', 'Nome da call', TextInputStyle.Short, 100]]],
            darcargo: ['Entregar cargo', [
                ['usuario', 'ID do usuário', TextInputStyle.Short, 20],
                ['cargo', 'ID do cargo personalizado', TextInputStyle.Short, 20]
            ]],
            addcall: ['Adicionar à call', [
                ['usuario', 'ID do usuário', TextInputStyle.Short, 20],
                ['call', 'ID da call personalizada', TextInputStyle.Short, 20]
            ]],
            vmute: ['Aplicar VMute', [
                ['usuario', 'ID do usuário', TextInputStyle.Short, 20],
                ['duracao', 'Duração: 1 hora, 1 dia ou 2 dias', TextInputStyle.Short, 10]
            ]]
        }[tipo];
        if (!configuracoes) return;

        const saldos = obterSaldosConfiguracao(interaction.guild.id, interaction.user.id);
        const possuiBeneficioDisponivel = {
            criarcargo: saldos.cargos > 0,
            criarcall: saldos.calls > 0,
            darcargo: listarCargosPersonalizados(interaction.guild.id, interaction.user.id).length > 0,
            addcall: listarCallsPersonalizadas(interaction.guild.id, interaction.user.id).length > 0,
            vmute: saldos.vmutes > 0
        }[tipo];

        if (interaction.message?.edit) {
            await interaction.message.edit({
                embeds: [montarEmbedConfiguracao(interaction.guild.id, interaction.user.id)],
                components: montarComponentesConfiguracao(interaction.guild.id, interaction.user.id)
            }).catch(() => {});
        }

        if (!possuiBeneficioDisponivel) {
            await interaction.reply({
                content: '❌ Esse benefício já foi consumido ou não está mais disponível. A mensagem foi atualizada.',
                flags: MessageFlags.Ephemeral
            }).catch(() => {});
            return;
        }

        const [titulo, campos] = configuracoes;
        const modal = new ModalBuilder()
            .setCustomId(`config_modal_${tipo}`)
            .setTitle(titulo)
            .addComponents(campos.map(([id, label, estilo, maxLength]) =>
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(id)
                        .setLabel(label)
                        .setStyle(estilo)
                        .setMaxLength(maxLength)
                        .setRequired(true)
                )
            ));
        await interaction.showModal(modal);
        return;
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('config_modal_')) {
        const tipo = interaction.customId.replace('config_modal_', '');
        const valor = id => interaction.fields.getTextInputValue(id).trim();

        try {
            if (tipo === 'criarcargo') {
                const nome = valor('nome');
                const cor = valor('cor').startsWith('#') ? valor('cor') : `#${valor('cor')}`;
                if (!/^#[0-9a-fA-F]{6}$/.test(cor)) throw new Error('A cor precisa estar no formato hexadecimal, como #FF0000.');
                const beneficio = obterCargoComBeneficioDisponivel(interaction.guild.id, interaction.user.id, 'cargosPersonalizados');
                if (!beneficio || !consumirBeneficio(interaction.guild.id, interaction.user.id, beneficio.id, 'cargosPersonalizados')) throw new Error('Você não possui cargo personalizado disponível.');
                let cargo;
                try {
                    cargo = await interaction.guild.roles.create({ name: nome, color: cor, reason: `Cargo personalizado criado por ${interaction.user.tag}` });
                    const criador = await interaction.guild.members.fetch(interaction.user.id);
                    await criador.roles.add(cargo, `Cargo criado por ${interaction.user.tag}`);
                    registrarCargoPersonalizado(interaction.guild.id, interaction.user.id, cargo);
                } catch (error) {
                    if (cargo) await cargo.delete('Falha ao atribuir cargo ao criador').catch(() => {});
                    devolverBeneficio(interaction.guild.id, interaction.user.id, beneficio.id, 'cargosPersonalizados');
                    throw error;
                }
                await atualizarConfiguracao(interaction);
                await interaction.reply({ content: `✅ Cargo ${cargo} criado.`, flags: MessageFlags.Ephemeral });
            } else if (tipo === 'criarcall') {
                const nome = valor('nome');
                const beneficio = obterCargoComBeneficioDisponivel(interaction.guild.id, interaction.user.id, 'callsPersonalizadas');
                if (!beneficio) throw new Error('Você não possui call personalizada disponível.');
                if (!consumirBeneficio(interaction.guild.id, interaction.user.id, beneficio.id, 'callsPersonalizadas')) {
                    throw new Error('Seu benefício de call personalizada já foi utilizado.');
                }
                const categoria = await interaction.guild.channels.fetch(CATEGORIA_CALLS_PERSONALIZADAS_ID).catch(() => null);
                if (!categoria || categoria.type !== ChannelType.GuildCategory) {
                    devolverBeneficio(interaction.guild.id, interaction.user.id, beneficio.id, 'callsPersonalizadas');
                    throw new Error('A categoria das calls personalizadas não foi encontrada.');
                }
                try {
                    const permissoesCall = [
                        {
                            id: interaction.guild.roles.everyone.id,
                            deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
                        },
                        ...[...CARGOS_EQUIPE].map(cargoId => ({
                            id: cargoId,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
                        })),
                        {
                            id: interaction.user.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
                        }
                    ];
                    const canal = await interaction.guild.channels.create({
                        name: nome,
                        type: ChannelType.GuildVoice,
                        parent: categoria.id,
                        permissionOverwrites: permissoesCall,
                        reason: `Call personalizada criada por ${interaction.user.tag}`
                    });
                    registrarCallPersonalizada(interaction.guild.id, interaction.user.id, canal);
                    await atualizarConfiguracao(interaction);
                    await interaction.reply({ content: `✅ Call ${canal} criada.`, flags: MessageFlags.Ephemeral });
                } catch (error) {
                    devolverBeneficio(interaction.guild.id, interaction.user.id, beneficio.id, 'callsPersonalizadas');
                    throw error;
                }
            } else if (tipo === 'darcargo') {
                const usuarioId = valor('usuario');
                const cargoId = valor('cargo');
                if (!listarCargosPersonalizados(interaction.guild.id, interaction.user.id).some(item => item.roleId === cargoId)) throw new Error('Esse cargo não pertence aos seus cargos personalizados.');
                const membro = await interaction.guild.members.fetch(usuarioId).catch(() => null);
                const cargo = await interaction.guild.roles.fetch(cargoId).catch(() => null);
                if (!membro || !cargo || !cargo.editable) throw new Error('Usuário ou cargo inválido, ou o bot não pode gerenciar esse cargo.');
                await membro.roles.add(cargo, `Cargo entregue por ${interaction.user.tag}`);
                await interaction.reply({ content: `✅ O cargo **${cargo.name}** foi entregue.`, flags: MessageFlags.Ephemeral });
            } else if (tipo === 'addcall') {
                const usuarioId = valor('usuario');
                const callId = valor('call');
                if (!listarCallsPersonalizadas(interaction.guild.id, interaction.user.id).some(item => item.channelId === callId)) throw new Error('Essa call não pertence às suas calls personalizadas.');
                const membro = await interaction.guild.members.fetch(usuarioId).catch(() => null);
                const canal = await interaction.guild.channels.fetch(callId).catch(() => null);
                if (!membro || !canal?.isVoiceBased()) throw new Error('Usuário ou call inválida.');
                await membro.voice.setChannel(canal, `Adicionado por ${interaction.user.tag}`);
                await interaction.reply({ content: `✅ Usuário adicionado à call **${canal.name}**.`, flags: MessageFlags.Ephemeral });
            } else if (tipo === 'vmute') {
                const duracao = valor('duracao');
                const duracoesMs = { '1 hora': 60 * 60 * 1000, '1 dia': 24 * 60 * 60 * 1000, '2 dias': 2 * 24 * 60 * 60 * 1000 };
                if (!duracoesMs[duracao] || !temVmuteDisponivel(interaction.guild.id, interaction.user.id, duracao)) throw new Error(`Você não possui VMute de ${duracao} disponível.`);
                const membro = await interaction.guild.members.fetch(valor('usuario')).catch(() => null);
                if (!membro) throw new Error('Esse usuário não está no servidor e não pode receber castigo.');
                if (membro.id === interaction.guild.ownerId) throw new Error('Não é possível punir o dono do servidor.');
                if (!membro.moderatable) throw new Error('Não consigo aplicar castigo nesse usuário. Verifique a hierarquia de cargos.');
                if (!consumirVmuteDisponivel(interaction.guild.id, interaction.user.id, duracao)) throw new Error(`Você não possui VMute de ${duracao} disponível.`);
                try {
                    await membro.timeout(duracoesMs[duracao], `VMute aplicado por ${interaction.user.tag}`);
                    await registrarPunicao(
                        { action: AuditLogEvent.MemberUpdate, targetId: membro.id, reason: `VMute de ${duracao}`, changes: [] },
                        interaction.guild,
                        { executor: interaction.user, motivo: `VMute de ${duracao}` }
                    ).catch(error => console.error('[vmute] Erro ao enviar registro da punição:', error));
                } catch (error) {
                    devolverVmuteDisponivel(interaction.guild.id, interaction.user.id, duracao);
                    throw error;
                }
                await atualizarConfiguracao(interaction);
                await interaction.reply({ content: `✅ <@${membro.id}> recebeu VMute por **${duracao}**.`, flags: MessageFlags.Ephemeral });
            }
        } catch (error) {
            await interaction.reply({ content: `❌ ${error.message}`, flags: MessageFlags.Ephemeral }).catch(() => {});
        }
        return;
    }

    if (interaction.isChatInputCommand() && interaction.commandName === 'editarcall') {
        const canal = interaction.member?.voice?.channel;
        if (!canal) {
            await interaction.reply({ content: '❌ Você precisa estar em uma call temporária criada pelo bot.', flags: MessageFlags.Ephemeral });
            return;
        }
        if (!await ehCallTemporaria(canal)) {
            await interaction.reply({ content: '❌ Essa call não foi criada pelo sistema de calls temporárias.', flags: MessageFlags.Ephemeral });
            return;
        }

        const modal = new ModalBuilder()
            .setCustomId(`editarcall_modal_${interaction.user.id}`)
            .setTitle('Mudar nome da call')
            .addComponents(new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('nome_call')
                    .setLabel('Novo nome da call')
                    .setStyle(TextInputStyle.Short)
                    .setValue(canal.name.slice(0, 100))
                    .setMinLength(1)
                    .setMaxLength(100)
                    .setRequired(true)
            ));
        await interaction.showModal(modal);
        return;
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('editarcall_modal_')) {
        const usuarioId = interaction.customId.replace('editarcall_modal_', '');
        if (usuarioId !== interaction.user.id) {
            await interaction.reply({ content: '❌ Este formulário pertence a outra pessoa.', flags: MessageFlags.Ephemeral });
            return;
        }

        const canal = interaction.member?.voice?.channel;
        const nome = interaction.fields.getTextInputValue('nome_call').trim();
        if (!canal || !await ehCallTemporaria(canal)) {
            await interaction.reply({ content: '❌ Você não está mais em uma call temporária criada pelo bot.', flags: MessageFlags.Ephemeral });
            return;
        }
        if (!nome) {
            await interaction.reply({ content: '❌ Informe um nome válido para a call.', flags: MessageFlags.Ephemeral });
            return;
        }

        try {
            await canal.setName(nome, `Nome da call alterado por ${interaction.user.tag}`);
            await interaction.reply({ content: `✅ O nome da call foi alterado para **${nome}**.`, flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error('[editarcall] Erro ao alterar nome da call:', error);
            await interaction.reply({ content: '❌ Não foi possível alterar o nome. Verifique se o bot pode gerenciar canais.', flags: MessageFlags.Ephemeral });
        }
        return;
    }

    if (interaction.isButton() && interaction.customId === 'parceria_pedir') {
        if (![CANAL_PARCERIAS_BANNER_ID, CANAL_INFLUENCER_BANNER_ID].includes(interaction.channelId) || !interaction.channel?.threads) {
            await interaction.reply({ content: '❌ Este botão só pode ser usado nos canais oficiais de parceria.', flags: MessageFlags.Ephemeral });
            return;
        }
        if (usuariosCriandoTopico.has(interaction.user.id)) {
            await interaction.reply({ content: '⏳ Seu tópico já está sendo criado, aguarde.', flags: MessageFlags.Ephemeral });
            return;
        }

        usuariosCriandoTopico.add(interaction.user.id);
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            const topicoExistente = await usuarioJaTemTopicoAberto(interaction.channel, interaction.user);
            if (topicoExistente) {
                await interaction.editReply(`❌ Você já tem um tópico aberto: ${topicoExistente}`);
                return;
            }

            const topico = await interaction.channel.threads.create({
                name: interaction.user.username,
                type: ChannelType.PublicThread,
                reason: `Novo pedido de parceria aberto por ${interaction.user.tag}`
            });

            try {
                const mensagens = await interaction.channel.messages.fetch({ limit: 5 });
                const mensagemSistema = mensagens.find(mensagem => mensagem.type === MessageType.ThreadCreated);
                if (mensagemSistema) await mensagemSistema.delete();
            } catch (error) {
                console.error('[parceria] Erro ao apagar mensagem automática de tópico:', error);
            }

            registrarTopicoAberto(interaction.channel, interaction.user, topico);
            registrarDadosDoTopico(topico, interaction.user);
            await topico.members.add(interaction.user.id);

            const cargoAtendimento = interaction.guild.roles.cache.get(CARGO_ATENDIMENTO_ID);
            if (cargoAtendimento) {
                for (const membroCargo of cargoAtendimento.members.values()) {
                    if (membroCargo.id !== interaction.user.id) {
                        await topico.members.add(membroCargo.id).catch(() => {});
                    }
                }
            }

            const embedTopico = new EmbedBuilder()
                .setColor(0x172554)
                .setDescription(`Olá, <@${interaction.user.id}>! Este tópico foi aberto para seu pedido de parceria.\nAguarde até que um responsável venha te atender.`);
            await topico.send({
                content: `<@${interaction.user.id}> <@&${CARGO_ATENDIMENTO_ID}>`,
                embeds: [embedTopico],
                components: componentesTicketAguardando()
            });
            await interaction.editReply(`Criei um tópico pra você: ${topico}`);
        } catch (error) {
            console.error('[parceria] Erro ao criar tópico:', error);
            await interaction.editReply('❌ Não foi possível criar o tópico de parceria.').catch(() => {});
        } finally {
            usuariosCriandoTopico.delete(interaction.user.id);
        }
        return;
    }

    if (interaction.isButton() && interaction.customId.startsWith('status_')) {
        const partes = interaction.customId.split('_');
        const tipoBotao = partes[1];

        try {
            await interaction.deferUpdate();
            if (tipoBotao === 'categoria' && ['call', 'chat', 'gemas'].includes(partes[2])) {
                const categoria = partes[2];
                await interaction.editReply({
                    embeds: [await montarEmbedStatus(interaction.guild, categoria)],
                    components: montarComponentesStatus(categoria)
                });
            } else if (tipoBotao === 'periodo' && ['call', 'chat', 'gemas'].includes(partes[2])) {
                await interaction.editReply({
                    embeds: [await montarEmbedStatus(interaction.guild, partes[2])],
                    components: montarComponentesStatus(partes[2])
                });
            }
        } catch (error) {
            console.error('[status] Erro ao trocar período:', error);
        }
        return;
    }

    if (interaction.isButton() && ['ticket_assumir', 'ticket_fechar'].includes(interaction.customId)) {
        if (!interaction.channel?.isThread()) return;

        try {
            if (interaction.customId === 'ticket_assumir') {
                const podeAssumir = interaction.member?.roles.cache.some(cargo =>
                    CARGOS_AUTORIZADOS_ASSUMIR_TICKET.has(cargo.id)
                );
                if (!podeAssumir) {
                    await interaction.reply({ content: '❌ Apenas Owner e Sub Owner podem assumir tickets.', flags: MessageFlags.Ephemeral });
                    return;
                }

                const conteudoAtual = interaction.message.content || '';
                const textoAssumido = conteudoAtual.includes('Assumido por')
                    ? conteudoAtual
                    : `${conteudoAtual}\n\n✅ Assumido por ${interaction.user}`;
                const dados = dadosDosTopicos.get(interaction.channel.id) || {};
                dados.assumidoPorId = interaction.user.id;
                dados.assumidoPorTag = interaction.user.tag;
                dadosDosTopicos.set(interaction.channel.id, dados);
                await interaction.update({
                    content: textoAssumido,
                    components: componentesTicketAssumido()
                });
                await avisarTicketAssumido(dados, interaction.user);
            } else {
                const dados = obterDadosTicket(interaction);
                if (!dados.assumidoPorId || dados.assumidoPorId !== interaction.user.id) {
                    await interaction.reply({ content: '❌ Apenas quem assumiu este ticket pode fechá-lo.', flags: MessageFlags.Ephemeral });
                    return;
                }
                await interaction.deferUpdate();
                await registrarEFecharTopico(interaction);
            }
        } catch (error) {
            console.error('[tickets] Erro ao processar botão:', error);
            if (interaction.deferred || interaction.replied) {
                await interaction.followUp({ content: '❌ Não foi possível processar o ticket.', flags: MessageFlags.Ephemeral }).catch(() => {});
            } else {
                await interaction.reply({ content: '❌ Não foi possível processar o ticket.', flags: MessageFlags.Ephemeral }).catch(() => {});
            }
        }
        return;
    }

    if (interaction.isButton() && interaction.customId.startsWith('punicao_mudar_tempo_')) {
        const podeAlterar = interaction.member?.roles.cache.some(cargo =>
            CARGOS_AUTORIZADOS_DECISAO_PUNICAO.has(cargo.id)
        );
        if (!podeAlterar) {
            await interaction.reply({ content: '❌ Você não tem permissão para mudar o tempo deste castigo.', flags: MessageFlags.Ephemeral });
            return;
        }

        const usuarioId = interaction.customId.replace('punicao_mudar_tempo_', '');
        const modal = new ModalBuilder()
            .setCustomId(`punicao_modal_tempo_${usuarioId}_${interaction.message.id}`)
            .setTitle('Mudar tempo do castigo')
            .addComponents(new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('tempo')
                    .setLabel('Novo tempo em minutos')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Ex.: 60')
                    .setRequired(true)
                    .setMinLength(1)
                    .setMaxLength(5)
            ));
        await interaction.showModal(modal);
        return;
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('punicao_modal_tempo_')) {
        const podeAlterar = interaction.member?.roles.cache.some(cargo =>
            CARGOS_AUTORIZADOS_DECISAO_PUNICAO.has(cargo.id)
        );
        if (!podeAlterar) {
            await interaction.reply({ content: '❌ Você não tem permissão para mudar o tempo deste castigo.', flags: MessageFlags.Ephemeral });
            return;
        }

        const dadosModal = interaction.customId.match(/^punicao_modal_tempo_(\d+)_(\d+)$/);
        const usuarioId = dadosModal?.[1] || interaction.customId.replace('punicao_modal_tempo_', '');
        const mensagemOrigemId = dadosModal?.[2];
        const tempo = Number(interaction.fields.getTextInputValue('tempo'));
        if (!Number.isInteger(tempo) || tempo < 1 || tempo > 40320) {
            await interaction.reply({ content: '❌ Informe um tempo inteiro entre 1 e 40320 minutos.', flags: MessageFlags.Ephemeral });
            return;
        }

        const membro = await interaction.guild.members.fetch(usuarioId).catch(() => null);
        if (!membro || !membro.moderatable) {
            await interaction.reply({ content: '❌ Não foi possível alterar o castigo desse usuário.', flags: MessageFlags.Ephemeral });
            return;
        }

        try {
            await membro.timeout(tempo * 60 * 1000, `Tempo alterado por ${interaction.user.tag}`);
            const duracao = `${tempo} minuto(s)`;
            const canalPunicoes = await interaction.guild.channels.fetch(CANAL_LOG_PUNICOES_ID).catch(() => null);
            const mensagemOrigem = mensagemOrigemId
                ? await canalPunicoes?.messages.fetch(mensagemOrigemId).catch(() => null)
                : null;
            const duracaoAnterior = mensagemOrigem?.embeds[0]?.fields?.find(campo => campo.name === 'Duração')?.value || 'Não informado';
            const mensagemPrincipal = interaction.channel.isThread()
                ? await interaction.channel.fetchStarterMessage().catch(() => null)
                : mensagemOrigem;
            const mensagensAtualizar = new Set([mensagemOrigem, mensagemPrincipal].filter(Boolean));
            const thread = interaction.channel.isThread() ? interaction.channel : mensagemOrigem?.thread;
            if (thread) {
                const mensagensDoTopico = await thread.messages.fetch({ limit: 50 }).catch(() => null);
                for (const mensagem of mensagensDoTopico?.values() || []) {
                    if (mensagem.components.some(linha => linha.components.some(componente =>
                        componente.customId === `punicao_mudar_tempo_${usuarioId}`
                    ))) mensagensAtualizar.add(mensagem);
                }
            }
            for (const mensagem of mensagensAtualizar) {
                if (!mensagem.embeds[0]) continue;
                const embedAtualizado = EmbedBuilder.from(mensagem.embeds[0]).setColor(0xF1C40F);
                const campos = embedAtualizado.data.fields || [];
                const campoDuracao = campos.find(campo => campo.name === 'Duração');
                if (campoDuracao) campoDuracao.value = duracao;
                const conteudo = mensagem.id === mensagemOrigemId
                    ? `<@&${CARGO_MARCAR_PUNICOES_ID}>\n<@${usuarioId}>\n⏳ Alteração de tempo feita por ${interaction.user}.\nTempo anterior: **${duracaoAnterior}**\nNovo tempo: **${duracao}**`
                    : mensagem.content;
                await mensagem.edit({
                    content: conteudo,
                    embeds: [embedAtualizado],
                    components: [],
                    allowedMentions: { roles: [CARGO_MARCAR_PUNICOES_ID], users: [usuarioId] }
                }).catch(() => {});
            }
            await interaction.reply({ content: `✅ Castigo de <@${usuarioId}> alterado para **${duracao}**.`, flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error('[punições] Erro ao mudar tempo:', error);
            await interaction.reply({ content: '❌ Não foi possível alterar o tempo do castigo.', flags: MessageFlags.Ephemeral });
        }
        return;
    }

    if (interaction.isButton() && interaction.customId.startsWith('punicao_pedir_ban_')) {
        const podeSolicitar = interaction.member?.roles.cache.some(cargo =>
            CARGOS_AUTORIZADOS_DECISAO_PUNICAO.has(cargo.id)
        );
        if (!podeSolicitar) {
            await interaction.reply({ content: '❌ Você não tem permissão para pedir um banimento.', flags: MessageFlags.Ephemeral });
            return;
        }

        const usuarioId = interaction.customId.replace('punicao_pedir_ban_', '');
        const chaveSolicitacao = `${interaction.guild.id}_${usuarioId}`;
        if (SOLICITACOES_BANIMENTO_PENDENTES.has(chaveSolicitacao)) {
            await interaction.reply({ content: '⏳ Já existe uma solicitação de banimento pendente para este usuário.', flags: MessageFlags.Ephemeral });
            return;
        }

        const canalBanimentos = await interaction.guild.channels.fetch(CANAL_LOG_BANS_ID).catch(() => null);
        if (!canalBanimentos) {
            await interaction.reply({ content: '❌ Canal de banimentos não encontrado.', flags: MessageFlags.Ephemeral });
            return;
        }

        const campoMotivo = interaction.message.embeds[0]?.fields?.find(campo => campo.name === 'Motivo');
        SOLICITACOES_BANIMENTO_PENDENTES.add(chaveSolicitacao);
        try {
            await canalBanimentos.send({
                content: `<@&${CARGO_MARCAR_PUNICOES_ID}>\n⏳ Solicitação de banimento enviada por ${interaction.user}.`,
                allowedMentions: { roles: [CARGO_MARCAR_PUNICOES_ID] },
                embeds: [new EmbedBuilder()
                    .setColor(0x95A5A6)
                    .setTitle('🔨 Solicitação de banimento')
                    .addFields(
                        { name: 'Usuário punido', value: usuarioId, inline: true },
                        { name: 'Solicitado por', value: `${interaction.user}`, inline: true },
                        { name: 'Motivo', value: campoMotivo?.value || 'Não informado' }
                    )
                    .setTimestamp()],
                components: [new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`punicao_aceitar_ban_${usuarioId}`)
                        .setLabel('Aceitar ban')
                        .setEmoji({ name: 'acept', id: 'SEU_ID_DISCORD' })
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId(`punicao_recusar_ban_${usuarioId}`)
                        .setLabel('Recusar ban')
                        .setEmoji({ name: 'recuse', id: 'SEU_ID_DISCORD' })
                        .setStyle(ButtonStyle.Secondary)
                )]
            });
            const embedAtualizado = interaction.message.embeds[0]
                ? EmbedBuilder.from(interaction.message.embeds[0]).setColor(0xE74C3C)
                : null;
            await interaction.message.edit({
                content: `<@&${CARGO_MARCAR_PUNICOES_ID}>\n🔨 Pedido de banimento feito.`,
                allowedMentions: { roles: [CARGO_MARCAR_PUNICOES_ID] },
                embeds: embedAtualizado ? [embedAtualizado] : [],
                components: []
            });
            await interaction.reply({ content: '✅ Solicitação de banimento enviada para aprovação.', flags: MessageFlags.Ephemeral });
        } catch (error) {
            SOLICITACOES_BANIMENTO_PENDENTES.delete(chaveSolicitacao);
            console.error('[ban] Erro ao enviar solicitação:', error);
            await interaction.reply({ content: '❌ Não foi possível enviar a solicitação de banimento.', flags: MessageFlags.Ephemeral });
        }
        return;
    }

    if (interaction.isButton() && (interaction.customId.startsWith('punicao_aceitar_ban_') || interaction.customId.startsWith('punicao_recusar_ban_'))) {
        const podeModerar = interaction.member?.roles.cache.some(cargo =>
            CARGOS_AUTORIZADOS_DECISAO_PUNICAO.has(cargo.id)
        );
        if (!podeModerar) {
            await interaction.reply({ content: '❌ Você não tem permissão para decidir sobre banimentos.', flags: MessageFlags.Ephemeral });
            return;
        }

        const aceitar = interaction.customId.startsWith('punicao_aceitar_ban_');
        const usuarioId = interaction.customId.replace(aceitar ? 'punicao_aceitar_ban_' : 'punicao_recusar_ban_', '');
        try {
            if (aceitar) {
                const membro = await interaction.guild.members.fetch(usuarioId).catch(() => null);
                if (membro && !membro.bannable) {
                    await interaction.reply({ content: '❌ Não consigo banir esse usuário por causa da hierarquia de cargos.', flags: MessageFlags.Ephemeral });
                    return;
                }
                BANIMENTOS_APROVADOS_PELO_BOT.add(`${interaction.guild.id}_${usuarioId}`);
                await interaction.guild.members.ban(usuarioId, { reason: `Ban aprovado por ${interaction.user.tag}` });
                SOLICITACOES_BANIMENTO_PENDENTES.delete(`${interaction.guild.id}_${usuarioId}`);
                const embedAceito = interaction.message.embeds[0]
                    ? EmbedBuilder.from(interaction.message.embeds[0]).setColor(0x2ECC71)
                    : null;
                await interaction.update({
                    content: `<@&${CARGO_MARCAR_PUNICOES_ID}>\n✅ Banimento aceito por ${interaction.user}. Usuário ${usuarioId} foi banido.`,
                    allowedMentions: { roles: [CARGO_MARCAR_PUNICOES_ID] },
                    embeds: embedAceito ? [embedAceito] : [],
                    components: []
                });
            } else {
                SOLICITACOES_BANIMENTO_PENDENTES.delete(`${interaction.guild.id}_${usuarioId}`);
                const embedRecusado = interaction.message.embeds[0]
                    ? EmbedBuilder.from(interaction.message.embeds[0]).setColor(0xE74C3C)
                    : null;
                await interaction.update({
                    content: `<@&${CARGO_MARCAR_PUNICOES_ID}>\n❌ Banimento recusado por ${interaction.user}. Nenhuma ação foi realizada.`,
                    allowedMentions: { roles: [CARGO_MARCAR_PUNICOES_ID] },
                    embeds: embedRecusado ? [embedRecusado] : [],
                    components: []
                });
            }
        } catch (error) {
            BANIMENTOS_APROVADOS_PELO_BOT.delete(`${interaction.guild.id}_${usuarioId}`);
            console.error('[ban] Erro ao decidir solicitação:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: '❌ Não foi possível processar esta solicitação de ban.', flags: MessageFlags.Ephemeral }).catch(() => {});
            }
        }
        return;
    }

    if (interaction.isChatInputCommand() && !['perfil', 'bau', 'horas', 'msg', 'top', 'doar', 'gema', 'cargovip', 'editarcall', 'buy', 'status'].includes(interaction.commandName)) {
        const fazParteDaEquipe = interaction.member?.roles.cache.some(cargo =>
            CARGOS_EQUIPE.has(cargo.id)
        );
        if (!fazParteDaEquipe) {
            await interaction.reply({ content: 'Você precisa ter um cargo da equipe para usar este comando.' });
            setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
            return;
        }
    }

    if (interaction.isButton() && interaction.customId.startsWith('punicao_')) {
        const podeModerar = interaction.member?.roles.cache.some(cargo =>
            CARGOS_AUTORIZADOS_DECISAO_PUNICAO.has(cargo.id)
        );
        if (!podeModerar) {
            await interaction.reply({ content: 'Você não tem permissão para decidir sobre punições.', flags: MessageFlags.Ephemeral });
            setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
            return;
        }

        const partes = interaction.customId.split('_');
        const decisao = partes[1];
        const tipo = partes[2];
        const usuarioId = decisao === 'aceitar' ? tipo : partes[3];

        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            if (decisao === 'recusar') {
                if (tipo === 'ban') {
                    await interaction.guild.members.unban(usuarioId, `Punição recusada por ${interaction.user.tag}`);
                } else {
                    const membro = await interaction.guild.members.fetch(usuarioId);
                    await membro.timeout(null, `Punição recusada por ${interaction.user.tag}`);
                }
            }

            const embedAtualizado = EmbedBuilder.from(interaction.message.embeds[0])
                .setColor(decisao === 'aceitar' ? 0x2ECC71 : 0xE74C3C);
            await interaction.message.edit({
                components: [],
                content: `${decisao === 'aceitar' ? '✅ Punição aceita' : '❌ Punição recusada e removida'} por ${interaction.user}.`,
                embeds: [embedAtualizado]
            });
            await interaction.editReply(decisao === 'aceitar'
                ? 'Punição mantida.'
                : 'Punição removida com sucesso.');
            setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
        } catch (error) {
            console.error('[punições] Erro ao processar decisão:', error);
            await interaction.editReply('Não foi possível processar essa decisão. Verifique as permissões do bot.').catch(() => {});
            setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
        }
        return;
    }

    // Punições
    if (interaction.isChatInputCommand() && interaction.commandName === 'clear') {
        const quantidade = interaction.options.getInteger('quantidade');

        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const apagadas = await interaction.channel.bulkDelete(quantidade, true);
            await interaction.editReply(`✅ ${apagadas.size} mensagens apagadas.`);
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Não foi possível apagar as mensagens. Isso pode acontecer se alguma delas tiver mais de 14 dias.').catch(() => {});
        }
        return;
    }

    if (interaction.isChatInputCommand() && interaction.commandName === 'perfil') {
        const usuario = interaction.options.getUser('usuario') ?? interaction.user;
        const membro = await interaction.guild.members.fetch(usuario.id).catch(() => null);

        if (!membro) {
            await interaction.reply({ content: 'Esse usuário não está no servidor.' });
            return;
        }

        const estatisticas = obterEstatisticasPerfil(usuario.id);
        const cargos = membro.roles.cache
            .filter(cargo => cargo.id !== interaction.guild.id)
            .map(cargo => cargo.toString())
            .join(' ')
            .slice(0, 1024) || 'Nenhum';

        const conta = obterContaEconomia(interaction.guild.id, usuario.id);
        const cargosComprados = CARGOS_LOJA
            .filter(cargo => membro.roles.cache.has(cargo.id))
            .map(cargo => `<@&${cargo.id}>`)
            .join(' ') || 'Nenhum';
        const embedPerfil = new EmbedBuilder()
            .setColor(0x00FFFF)
            .setAuthor({ name: usuario.username, iconURL: usuario.displayAvatarURL({ extension: 'png', size: 128 }) })
            .setThumbnail(usuario.displayAvatarURL({ extension: 'png', size: 512 }))
            .setDescription(
                '**Atividade no Servidor**\n' +
                `> Mensagem: \`${estatisticas.mensagens}\`\n` +
                `> Call: \`${formatarHorasPerfil(usuario.id, interaction.guild.id)}\`\n\n` +
                '**Economia**\n' + 
                `> Gemas: **${conta.gemas.toLocaleString('pt-BR')} ${EMOJI_GEMA}**\n` +
                `> Cargo comprado: ${cargosComprados}`
            )  
            .addFields(
                { name: 'Cargos', value: cargos }
            )
            .setFooter({ text: `ID: ${usuario.id}` })
            .setTimestamp();

        await interaction.reply({
            embeds: [embedPerfil]
        });
        return;
    }

    if (interaction.isChatInputCommand() && ['horas', 'msg'].includes(interaction.commandName)) {
        const usuario = interaction.options.getUser('usuario') ?? interaction.user;
        const membro = await interaction.guild.members.fetch(usuario.id).catch(() => null);
        if (!membro) {
            await interaction.reply({ content: 'Esse usuário não está no servidor.' });
            return;
        }

        const atividadeTotal = obterAtividadeUsuario(interaction.guild, usuario.id);
        const ehHoras = interaction.commandName === 'horas';
        const embedAtividade = new EmbedBuilder()
            .setColor(0x00FFFF)
            .setAuthor({ name: membro.displayName, iconURL: usuario.displayAvatarURL({ extension: 'png', size: 128 }) })
            .setThumbnail(usuario.displayAvatarURL({ extension: 'png', size: 512 }))
            .setTitle(ehHoras ? 'Horas de call' : 'Mensagens')
            .addFields(
                { name: ehHoras ? 'Total de horas' : 'Total de mensagens', value: ehHoras ? formatarHorasStatus(atividadeTotal.vozMs) : `${atividadeTotal.mensagens} mensagem(ns)`, inline: true }
            );
        await interaction.reply({ embeds: [embedAtividade] });
        return;
    }

    if (interaction.isChatInputCommand() && interaction.commandName === 'top') {
        const tipo = interaction.options.getString('tipo', true);
        await interaction.deferReply();
        const ranking = tipo === 'gemas'
            ? obterTopGemas(interaction.guild)
            : obterTopAtividade(interaction.guild, tipo === 'mensagens' ? 'mensagens' : 'horas');
        const embedTop = new EmbedBuilder()
            .setColor(0x00FFFF)
            .setTitle(`Top 10 — ${tipo === 'gemas' ? 'Gemas' : tipo === 'mensagens' ? 'Mensagens' : 'Horas de call'}`)
            .setDescription(tipo === 'gemas'
                ? formatarListaRanking(ranking, valor => `${valor.toLocaleString('pt-BR')} ${EMOJI_GEMA}`)
                : tipo === 'mensagens'
                    ? formatarListaRanking(ranking, valor => `${valor} mensagem(ns)`)
                    : formatarListaRanking(ranking, formatarHorasStatus));
        await interaction.editReply({ embeds: [embedTop] });
        return;
    }

    if (interaction.isChatInputCommand() && interaction.commandName === 'gema') {
        const conta = obterContaEconomia(interaction.guild.id, interaction.user.id);
        await interaction.reply({
            content: `Você possui **${conta.gemas.toLocaleString('pt-BR')} ${EMOJI_GEMA}**.`
        });
        return;
    }

    if (interaction.isChatInputCommand() && interaction.commandName === 'doar') {
        const destinatario = interaction.options.getUser('usuario', true);
        const quantidade = interaction.options.getInteger('quantidade', true);
        if (destinatario.id === interaction.user.id) {
            await interaction.reply({ content: 'Você não pode doar gemas para si mesmo.' });
            return;
        }

        const membroDestinatario = await interaction.guild.members.fetch(destinatario.id).catch(() => null);
        if (!membroDestinatario) {
            await interaction.reply({ content: 'O usuário precisa estar no servidor para receber gemas.' });
            return;
        }

        const contaDoador = obterContaEconomia(interaction.guild.id, interaction.user.id);
        if (contaDoador.gemas < quantidade) {
            await interaction.reply({ content: `Você não possui gemas suficientes. Seu saldo é **${contaDoador.gemas} ${EMOJI_GEMA}**.` });
            return;
        }

        const contaDestinatario = obterContaEconomia(interaction.guild.id, destinatario.id);
        contaDoador.gemas -= quantidade;
        contaDestinatario.gemas += quantidade;
        salvarEstadoPerfis();
        await interaction.reply({ content: `${interaction.user} doou **${quantidade.toLocaleString('pt-BR')} ${EMOJI_GEMA}** para ${destinatario}.` });
        return;
    }

    if (interaction.isChatInputCommand() && interaction.commandName === 'status') {
        if (!interaction.guild) {
            await interaction.reply({ content: '❌ O comando `/status` só pode ser usado em servidores.', flags: MessageFlags.Ephemeral });
            return;
        }

        await interaction.deferReply();
        await interaction.editReply({
            embeds: [await montarEmbedStatus(interaction.guild, 'call')],
            components: montarComponentesStatus('call')
        });
        return;
    }

    if (interaction.isChatInputCommand() && interaction.commandName === 'bau') {
        const conta = obterContaEconomia(interaction.guild.id, interaction.user.id);
        const tempoDesdeUltimoBau = Date.now() - conta.ultimoBau;
        if (tempoDesdeUltimoBau < COOLDOWN_BAU_MS) {
            const tempoRestanteMs = COOLDOWN_BAU_MS - tempoDesdeUltimoBau;
            const horasRestantes = Math.floor(tempoRestanteMs / HORA_EM_MS);
            const minutosRestantes = Math.ceil((tempoRestanteMs % HORA_EM_MS) / 60000);
            await interaction.reply({
                content: `⏳ Você já abriu o baú. Tente novamente em **${horasRestantes}h ${minutosRestantes}min**.`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const recompensa = Math.floor(Math.random() * 951) + 50;
        conta.gemas += recompensa;
        conta.ultimoBau = Date.now();
        salvarEstadoPerfis();

        const gifBau = new AttachmentBuilder(CAMINHO_GIF_BAU, { name: 'bau.gif' });
        const embedAbrindoBau = new EmbedBuilder()
            .setColor(0x00FFFF)
            .setDescription('## <:fekz5wrtflfd1:SEU_ID_DISCORD> BAU DA PENNY\n\n**Abrindo o baú da Penny...**')
            .setImage('attachment://bau.gif');
        await interaction.reply({ embeds: [embedAbrindoBau], files: [gifBau] });
        setTimeout(() => interaction.editReply({
            embeds: [montarEmbedBau(interaction.member, recompensa, conta)],
            files: []
        }).catch(error => console.error('[bau] Erro ao mostrar recompensa:', error)), 4000);
        return;
    }

    if (interaction.isChatInputCommand() && interaction.commandName === 'give') {
        const autorizado = interaction.member?.roles.cache.has(CARGO_OWNER_ID);
        if (!autorizado) {
            await interaction.reply({
                content: 'Somente o cargo Owner pode usar este comando.'
            });
            setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
            return;
        }

        const usuario = interaction.options.getUser('usuario', true);
        const quantidade = interaction.options.getInteger('quantidade', true);
        const conta = obterContaEconomia(interaction.guild.id, usuario.id);
        conta.gemas += quantidade;
        salvarEstadoPerfis();

        await interaction.reply({
            content: `${interaction.user} adicionou **${quantidade.toLocaleString('pt-BR')} ${EMOJI_GEMA}** para ${usuario}. Saldo atual: **${conta.gemas.toLocaleString('pt-BR')} ${EMOJI_GEMA}**.`
        });
        return;
    }

    if (interaction.isChatInputCommand() && interaction.commandName === 'remove') {
        const autorizado = interaction.member?.roles.cache.has(CARGO_OWNER_ID);
        if (!autorizado) {
            await interaction.reply({
                content: 'Somente o cargo Owner pode usar este comando.'
            });
            setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
            return;
        }

        const usuario = interaction.options.getUser('usuario', true);
        const quantidade = interaction.options.getInteger('quantidade', true);
        const conta = obterContaEconomia(interaction.guild.id, usuario.id);

        if (conta.gemas < quantidade) {
            await interaction.reply({
                content: `❌ Não foi possível remover **${quantidade.toLocaleString('pt-BR')} ${EMOJI_GEMA}** de ${usuario}. O saldo atual é **${conta.gemas.toLocaleString('pt-BR')} ${EMOJI_GEMA}**.`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        conta.gemas -= quantidade;
        salvarEstadoPerfis();

        await interaction.reply({
            content: `${interaction.user} removeu **${quantidade.toLocaleString('pt-BR')} ${EMOJI_GEMA}** de ${usuario}. Saldo atual: **${conta.gemas.toLocaleString('pt-BR')} ${EMOJI_GEMA}**.`
        });
        return;
    }

    // Função auxiliar para converter tempo customizado (ex: 7d, 12h, 30m) em millisegundos
    function converterTempoEmMs(tempoStr) {
        if (!tempoStr) return DURACAO_CARGO_COMPRA_MS; // 30 dias por padrão
        
        const match = tempoStr.toLowerCase().match(/^(\d+)([dhm])$/);
        if (!match) return null; // Formato inválido
        
        const valor = parseInt(match[1]);
        const unidade = match[2];
        
        let ms = 0;
        if (unidade === 'd') ms = valor * 24 * 60 * 60 * 1000; // dias
        if (unidade === 'h') ms = valor * 60 * 60 * 1000; // horas
        if (unidade === 'm') ms = valor * 60 * 1000; // minutos
        
        return ms > 0 ? ms : null;
    }

    if (interaction.isChatInputCommand() && interaction.commandName === 'set') {
        const autorizado = interaction.member?.roles.cache.has(CARGO_OWNER_ID);
        if (!autorizado) {
            await interaction.reply({
                content: 'Somente o cargo Owner pode usar este comando.',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const usuario = interaction.options.getUser('usuario', true);
        const cargo = CARGOS_LOJA.find(item => item.id === interaction.options.getString('cargo', true));
        const tempoCustomizado = interaction.options.getString('tempo', false);
        const membro = await interaction.guild.members.fetch(usuario.id).catch(() => null);
        
        if (!cargo || !membro) {
            await interaction.reply({ content: '❌ Não foi possível encontrar o cargo ou o usuário no servidor.', flags: MessageFlags.Ephemeral });
            return;
        }

        // Valida e converte o tempo customizado
        let duracaoMs = DURACAO_CARGO_COMPRA_MS;
        let tempoExibido = '30 dias';
        
        if (tempoCustomizado) {
            duracaoMs = converterTempoEmMs(tempoCustomizado);
            if (!duracaoMs) {
                await interaction.reply({ 
                    content: '❌ Formato de tempo inválido. Use: `7d` (dias), `12h` (horas), ou `30m` (minutos).', 
                    flags: MessageFlags.Ephemeral 
                });
                return;
            }
            
            // Gera texto legível do tempo
            if (tempoCustomizado.includes('d')) tempoExibido = `${parseInt(tempoCustomizado)}d`;
            else if (tempoCustomizado.includes('h')) tempoExibido = `${parseInt(tempoCustomizado)}h`;
            else if (tempoCustomizado.includes('m')) tempoExibido = `${parseInt(tempoCustomizado)}m`;
        }

        const cargoServidor = await interaction.guild.roles.fetch(cargo.id).catch(() => null);
        const membroBot = interaction.guild.members.me || await interaction.guild.members.fetch(client.user.id).catch(() => null);
        if (!cargoServidor || !membroBot?.permissions.has(PermissionFlagsBits.ManageRoles)) {
            await interaction.reply({ content: '❌ O bot não tem a permissão de gerenciar cargos.', flags: MessageFlags.Ephemeral });
            return;
        }
        if (!cargoServidor.editable || cargoServidor.position >= membroBot.roles.highest.position) {
            await interaction.reply({ content: '❌ O cargo está acima do cargo do bot. Mova o cargo do bot para cima dos cargos da loja.', flags: MessageFlags.Ephemeral });
            return;
        }

        try {
            await membro.roles.add(cargoServidor, `Cargo ${cargo.nome} definido por ${interaction.user.tag}`);
            const compras = obterComprasUsuario(interaction.guild.id, usuario.id);
            compras[cargo.id] = Date.now() + duracaoMs;
            obterBeneficiosUsuario(interaction.guild.id, usuario.id, cargo);
            salvarEstadoPerfis();
            await interaction.reply({ content: `✅ O cargo **${cargo.nome}** foi definido para ${usuario} por **${tempoExibido}**.`, flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error('[set] Erro ao definir cargo:', error);
            await interaction.reply({ content: '❌ Não foi possível definir o cargo para esse usuário.', flags: MessageFlags.Ephemeral });
        }
        return;
    }

    if (interaction.isChatInputCommand() && interaction.commandName === 'buy') {
        if (!interaction.guild) {
            await interaction.reply({ content: '❌ O comando `/buy` só pode ser usado em servidores.', flags: MessageFlags.Ephemeral });
            return;
        }

        const cargoId = interaction.options.getString('cargo', true);
        const cargo = CARGOS_LOJA.find(item => item.id === cargoId);
        const membro = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
        if (!cargo || !membro) {
            await interaction.reply({ content: '❌ Não foi possível encontrar o cargo ou seu membro no servidor.', flags: MessageFlags.Ephemeral });
            return;
        }

        const compras = obterComprasUsuario(interaction.guild.id, interaction.user.id);
        const agora = Date.now();
        if (compras[cargo.id] && compras[cargo.id] > agora) {
            const diasRestantes = Math.ceil((compras[cargo.id] - agora) / (24 * 60 * 60 * 1000));
            await interaction.reply({ content: `❌ Você já possui esse cargo. Ele expira em aproximadamente **${diasRestantes} dia(s)**.`, flags: MessageFlags.Ephemeral });
            return;
        }

        const possuiCargoVip = membro.roles.cache.some(role => CARGOS_LOJA.some(item => item.id === role.id)) ||
            CARGOS_LOJA.some(item => compras[item.id] && compras[item.id] > agora);
        if (possuiCargoVip) {
            await interaction.reply({ content: '❌ Você já possui um cargo VIP. O comando `/buy` permite apenas 1 cargo VIP por pessoa. Para comprar mais de um, procure o tópico da loja.', flags: MessageFlags.Ephemeral });
            return;
        }

        const conta = obterContaEconomia(interaction.guild.id, interaction.user.id);
        if (conta.gemas < cargo.precoGemas) {
            await interaction.reply({ content: `❌ Você não possui gemas suficientes. São necessárias **${cargo.precoGemas.toLocaleString('pt-BR')} ${EMOJI_GEMA}** e você possui **${conta.gemas.toLocaleString('pt-BR')} ${EMOJI_GEMA}**.`, flags: MessageFlags.Ephemeral });
            return;
        }
        const cargoServidor = await interaction.guild.roles.fetch(cargo.id).catch(() => null);
        const membroBot = interaction.guild.members.me || await interaction.guild.members.fetch(client.user.id).catch(() => null);
        if (!cargoServidor || !membroBot?.permissions.has('ManageRoles')) {
            await interaction.reply({ content: '❌ O bot não tem a permissão de gerenciar cargos.', flags: MessageFlags.Ephemeral });
            return;
        }
        if (!cargoServidor.editable || cargoServidor.position >= membroBot.roles.highest.position) {
            await interaction.reply({ content: '❌ O cargo comprado está acima do cargo do bot. Mova o cargo do bot para cima dos cargos da loja nas configurações do servidor.', flags: MessageFlags.Ephemeral });
            return;
        }

        try {
            await membro.roles.add(cargo.id, `Compra de ${cargo.nome} por 30 dias`);
            conta.gemas -= cargo.precoGemas;
            compras[cargo.id] = agora + DURACAO_CARGO_COMPRA_MS;
            obterBeneficiosUsuario(interaction.guild.id, interaction.user.id, cargo);
            salvarEstadoPerfis();
            await interaction.reply({ content: `✅ Você comprou o cargo **${cargo.nome}** por **30 dias**. Foram descontadas **${cargo.precoGemas.toLocaleString('pt-BR')} ${EMOJI_GEMA}**.`, flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error('[buy] Erro ao entregar cargo:', error);
            await interaction.reply({ content: '❌ Não foi possível entregar o cargo. Suas gemas não foram descontadas.', flags: MessageFlags.Ephemeral });
        }
        return;
    }

    if (interaction.isChatInputCommand() && interaction.commandName === 'rec') {
        const autorizado = interaction.member?.roles.cache.some(cargo =>
            CARGOS_AUTORIZADOS_REC.has(cargo.id)
        );
        if (!autorizado) {
            await interaction.reply({ content: 'Somente Owner, Sub Owner e Sup podem aprovar membros para a Staff.' });
            setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
            return;
        }

        const usuario = interaction.options.getUser('usuario', true);
        const membro = await interaction.guild.members.fetch(usuario.id).catch(() => null);

        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            if (!membro) {
                await interaction.editReply('Esse usuário não está no servidor.');
                return;
            }
            if (!membro.manageable) {
                await interaction.editReply('Não consigo adicionar o cargo Staff a esse usuário por causa da hierarquia de cargos.');
                return;
            }

            await membro.roles.add(CARGO_STAFF_ID, `Aprovado por ${interaction.user.tag}`);
            const embedAprovacao = new EmbedBuilder()
                .setColor(0x2ECC71)
                .setTitle('✅ Aprovação para a Staff')
                .setDescription(
                    `<@${usuario.id}>, parabéns! Você foi aprovado para a Staff do nosso servidor.\n\n` +
                    'Siga as orientações dos supervisores e obrigado pela sua colaboração.'
                )
                .setThumbnail(usuario.displayAvatarURL({ extension: 'png', size: 256 }))
                .setTimestamp();

            await interaction.channel.send({
                content: `<@${usuario.id}>`,
                embeds: [embedAprovacao],
                allowedMentions: { users: [usuario.id] }
            });
            await interaction.editReply('Usuário aprovado e cargo Staff adicionado com sucesso.');
        } catch (error) {
            console.error('Erro ao aprovar usuário para Staff:', error);
            await interaction.editReply('Não foi possível aprovar o usuário. Verifique as permissões e a hierarquia do bot.').catch(() => {});
        }
        return;
    }

    if (interaction.isChatInputCommand() && (interaction.commandName === 'mute' || interaction.commandName === 'ban')) {
        const usuario = interaction.options.getUser('usuario', true);
        const motivo = interaction.options.getString('motivo', true);
        const membro = await interaction.guild.members.fetch(usuario.id).catch(() => null);

        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            if (membro && membro.id === interaction.guild.ownerId) {
                await interaction.editReply('Não é possível punir o dono do servidor.');
                return;
            }

            if (!membro && interaction.commandName === 'mute') {
                await interaction.editReply('Esse usuário não está no servidor e não pode receber castigo.');
                return;
            }

            if (membro && !membro.moderatable && interaction.commandName === 'mute') {
                await interaction.editReply('Não consigo aplicar castigo nesse usuário. Verifique a hierarquia de cargos.');
                return;
            }

            if (membro && !membro.bannable && interaction.commandName === 'ban') {
                await interaction.editReply('Não consigo banir esse usuário. Verifique a hierarquia de cargos.');
                return;
            }

            if (interaction.commandName === 'mute') {
                const tempo = interaction.options.getInteger('tempo', true);
                await membro.timeout(tempo * 60 * 1000, motivo);
                await registrarPunicao(
                    { action: AuditLogEvent.MemberUpdate, targetId: usuario.id, reason: motivo, changes: [] },
                    interaction.guild,
                    { executor: interaction.user, motivo }
                ).catch(error => console.error('[mute] Erro ao enviar registro da punição:', error));
                await interaction.editReply(`✅ <@${usuario.id}> recebeu castigo por **${tempo} minuto(s)**.`);
            } else {
                await registrarPunicao(
                    { action: AuditLogEvent.MemberBanAdd, targetId: usuario.id, reason: motivo, changes: [] },
                    interaction.guild,
                    { executor: interaction.user, motivo }
                ).catch(error => console.error('[ban] Erro ao enviar registro da punição:', error));
                await interaction.editReply(`⏳ Solicitação de banimento de <@${usuario.id}> enviada para aprovação.`);
            }
        } catch (error) {
            console.error(`[${interaction.commandName}] Erro ao aplicar punição:`, error);
            await interaction.editReply('Não foi possível aplicar a punição. Verifique as permissões do bot.').catch(() => {});
        }
        return;
    }

    // Estatísticas
    if (interaction.isChatInputCommand() && interaction.commandName === 'ofctime') {
        const tipo = interaction.options.getString('tipo');
        const quantidade = interaction.options.getInteger('quantidade');

        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const estado = lerEstadoCampeonato();
            if (!estado || !estado.messageId) {
                await interaction.editReply('❌ Não há uma mensagem de campeonato registrada em .campeonato-estado.json. Configure o messageId dessa mensagem manualmente nesse arquivo.');
                return;
            }

            const canalCampeonato = interaction.guild.channels.cache.get(CANAL_CAMPEONATO_ID);
            if (!canalCampeonato) {
                await interaction.editReply('❌ Canal do campeonato não encontrado. Verifique CANAL_CAMPEONATO_ID.');
                return;
            }

            const limite = tipo === 'solo' ? LIMITE_INSCRICOES_SOLO : LIMITE_INSCRICOES_EQUIPE;
            const valorFinal = Math.max(0, Math.min(limite, quantidade));

            if (tipo === 'solo') {
                estado.solo = valorFinal;
            } else {
                estado.equipe = valorFinal;
            }
            salvarEstadoCampeonato(estado);

            const mensagemCampeonato = await canalCampeonato.messages.fetch(estado.messageId);
            const embedAtualizado = montarEmbedCampeonato(estado, canalCampeonato.guild.id);
            await mensagemCampeonato.edit({ embeds: [embedAtualizado] });

            await interaction.editReply(
                `✅ Placar atualizado — Solo: **${estado.solo}/${LIMITE_INSCRICOES_SOLO}** | Equipe: **${estado.equipe}/${LIMITE_INSCRICOES_EQUIPE}**`
            );
        } catch (error) {
            console.error('Erro ao atualizar placar do campeonato (/ofctime):', error);
            await interaction.editReply('❌ Não foi possível atualizar o placar do campeonato.').catch(() => {});
        }
        return;
    }

    if (interaction.isButton() && interaction.customId === 'loja_precos') {
        try {
            const embedPrecos = new EmbedBuilder()
                .setColor(COR_LOJA)
                .setDescription(montarDescricaoLojaCargos());

            await interaction.reply({ embeds: [embedPrecos], flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error('Erro ao responder botão de preços:', error);
        }
        return;
    }

    if (interaction.isButton() && interaction.customId === 'loja_comprar') {
        if (usuariosCriandoTopico.has(interaction.user.id)) {
            await interaction.reply({ content: '⏳ Seu tópico já está sendo criado, aguarde.', flags: MessageFlags.Ephemeral }).catch(() => {});
            return;
        }
        usuariosCriandoTopico.add(interaction.user.id);

        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const topicoExistente = await usuarioJaTemTopicoAberto(interaction.channel, interaction.user);
            if (topicoExistente) {
                await interaction.editReply(`❌ Você já tem um tópico aberto: ${topicoExistente}`);
                return;
            }

            const topico = await interaction.channel.threads.create({
                name: interaction.user.username,
                type: ChannelType.PublicThread,
                reason: `Novo pedido de compra aberto por ${interaction.user.tag}`
            });
            registrarTopicoAberto(interaction.channel, interaction.user, topico);
            registrarDadosDoTopico(topico, interaction.user);

            await topico.members.add(interaction.user.id);

            try {
                const mensagens = await interaction.channel.messages.fetch({ limit: 5 });
                const msgSistema = mensagens.find(m => m.type === MessageType.ThreadCreated);
                if (msgSistema) await msgSistema.delete();
            } catch (erroSistema) {
                console.error('Não consegui apagar o aviso de tópico criado:', erroSistema);
            }

            const embedAguardar = new EmbedBuilder()
                .setColor(COR_LOJA)
                .setDescription('Aguarde até, que um responsável venha te atender.');

            await topico.send({ content: `<@${interaction.user.id}> <@&${CARGO_ATENDIMENTO_ID}>`, embeds: [embedAguardar], components: componentesTicketAguardando() });

            await interaction.editReply(`Criei um tópico pra você: ${topico}`);
        } catch (error) {
            console.error('Erro ao criar o tópico de compra:', error);
            await interaction.editReply('❌ Não foi possível criar o tópico.').catch(() => {});
        } finally {
            usuariosCriandoTopico.delete(interaction.user.id);
        }
        return;
    }

    if (interaction.isButton() && (interaction.customId === 'campeonato_solo' || interaction.customId === 'campeonato_time')) {
        const tipoInscricao = interaction.customId === 'campeonato_solo' ? 'Solo' : 'Time';

        if (usuariosCriandoTopico.has(interaction.user.id)) {
            await interaction.reply({ content: '⏳ Seu tópico já está sendo criado, aguarde.', flags: MessageFlags.Ephemeral }).catch(() => {});
            return;
        }
        usuariosCriandoTopico.add(interaction.user.id);

        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const topicoExistente = await usuarioJaTemTopicoAberto(interaction.channel, interaction.user);
            if (topicoExistente) {
                await interaction.editReply(`❌ Você já tem um tópico aberto: ${topicoExistente}`);
                return;
            }

            const topico = await interaction.channel.threads.create({
                name: interaction.user.username,
                type: ChannelType.PublicThread,
                reason: `Nova inscrição (${tipoInscricao}) no campeonato aberta por ${interaction.user.tag}`
            });
            registrarTopicoAberto(interaction.channel, interaction.user, topico);
            registrarDadosDoTopico(topico, interaction.user);

            await topico.members.add(interaction.user.id);

            try {
                const mensagens = await interaction.channel.messages.fetch({ limit: 5 });
                const msgSistema = mensagens.find(m => m.type === MessageType.ThreadCreated);
                if (msgSistema) await msgSistema.delete();
            } catch (erroSistema) {
                console.error('Não consegui apagar o aviso de tópico criado:', erroSistema);
            }

            const embedAguardar = new EmbedBuilder()
                .setColor(COR_CAMPEONATO)
                .setDescription(
                    `Este tópico foi aberto para uma inscrição **${tipoInscricao}** no campeonato.\n` +
                    `Aguarde até, que um responsável venha te atender.`
                );

            await topico.send({ content: `<@${interaction.user.id}> <@&${CARGO_ATENDIMENTO_ID}>`, embeds: [embedAguardar], components: componentesTicketAguardando() });

            await interaction.editReply(`Criei um tópico pra você: ${topico}`);
        } catch (error) {
            console.error('Erro ao criar o tópico de inscrição do campeonato:', error);
            await interaction.editReply('❌ Não foi possível criar o tópico.').catch(() => {});
        } finally {
            usuariosCriandoTopico.delete(interaction.user.id);
        }
        return;
    }

    if (interaction.isButton() && interaction.message.embeds[0]?.image?.url?.includes('banner_sejastaff')) {
        if (usuariosCriandoTopico.has(interaction.user.id)) {
            await interaction.reply({ content: 'Seu tópico já está sendo criado, aguarde.', flags: MessageFlags.Ephemeral }).catch(() => {});
            return;
        }
        usuariosCriandoTopico.add(interaction.user.id);

        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            const topicoExistente = await usuarioJaTemTopicoAberto(interaction.channel, interaction.user);
            if (topicoExistente) {
                await interaction.editReply(`Você já tem um tópico aberto: ${topicoExistente}`);
                return;
            }

            const topico = await interaction.channel.threads.create({
                name: interaction.user.username,
                type: ChannelType.PublicThread,
                reason: `Nova candidatura para Staff aberta por ${interaction.user.tag}`
            });
            registrarTopicoAberto(interaction.channel, interaction.user, topico);
            registrarDadosDoTopico(topico, interaction.user);
            await topico.members.add(interaction.user.id);

            try {
                const mensagens = await interaction.channel.messages.fetch({ limit: 5 });
                const msgSistema = mensagens.find(mensagem => mensagem.type === MessageType.ThreadCreated);
                if (msgSistema) await msgSistema.delete();
            } catch (error) {
                console.error('Erro ao apagar aviso automático do tópico de Staff:', error);
            }

            const cargoAtendimento = interaction.guild.roles.cache.get(CARGO_ATENDIMENTO_ID);
            if (cargoAtendimento) {
                for (const membroCargo of cargoAtendimento.members.values()) {
                    if (membroCargo.id !== interaction.user.id) {
                        await topico.members.add(membroCargo.id).catch(() => {});
                    }
                }
            }

            const embedCandidatura = new EmbedBuilder()
                .setColor(COR_OFICIALIZAR)
                .setDescription(`Olá, <@${interaction.user.id}>! Este tópico foi aberto para sua candidatura à equipe.\nAguarde até que um responsável venha te atender.`);

            await topico.send({
                content: `<@${interaction.user.id}> <@&${CARGO_ATENDIMENTO_ID}>`,
                embeds: [embedCandidatura],
                components: componentesTicketAguardando()
            });
            await interaction.editReply(`Candidatura aberta: ${topico}`);
        } catch (error) {
            console.error('Erro ao criar tópico de candidatura para Staff:', error);
            await interaction.editReply('Não foi possível criar o tópico de candidatura.').catch(() => {});
        } finally {
            usuariosCriandoTopico.delete(interaction.user.id);
        }
        return;
    }

    // Tickets
    if (interaction.isButton() && interaction.customId === 'oficializar_time') {
        if (usuariosCriandoTopico.has(interaction.user.id)) {
            await interaction.reply({ content: '⏳ Seu tópico já está sendo criado, aguarde.', flags: MessageFlags.Ephemeral }).catch(() => {});
            return;
        }
        usuariosCriandoTopico.add(interaction.user.id);

        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const topicoExistente = await usuarioJaTemTopicoAberto(interaction.channel, interaction.user);
            if (topicoExistente) {
                await interaction.editReply(`❌ Você já tem um tópico aberto: ${topicoExistente}`);
                return;
            }

            const topico = await interaction.channel.threads.create({
                name: interaction.user.username,
                type: ChannelType.PublicThread,
                reason: `Novo pedido de oficialização de time aberto por ${interaction.user.tag}`
            });
            registrarTopicoAberto(interaction.channel, interaction.user, topico);
            registrarDadosDoTopico(topico, interaction.user);

            await topico.members.add(interaction.user.id);

            try {
                const mensagens = await interaction.channel.messages.fetch({ limit: 5 });
                const msgSistema = mensagens.find(m => m.type === MessageType.ThreadCreated);
                if (msgSistema) await msgSistema.delete();
            } catch (erroSistema) {
                console.error('Não consegui apagar o aviso de tópico criado:', erroSistema);
            }

            const embedAguardar = new EmbedBuilder()
                .setColor(COR_OFICIALIZAR)
                .setDescription('Aguarde até, que um responsável venha te atender.');

            await topico.send({ content: `<@${interaction.user.id}> <@&${CARGO_ATENDIMENTO_ID}>`, embeds: [embedAguardar], components: componentesTicketAguardando() });

            await interaction.editReply(`Criei um tópico pra você: ${topico}`);
        } catch (error) {
            console.error('Erro ao criar o tópico de oficialização:', error);
            await interaction.editReply('❌ Não foi possível criar o tópico.').catch(() => {});
        } finally {
            usuariosCriandoTopico.delete(interaction.user.id);
        }
        return;
    }

    if (interaction.isButton() && interaction.customId === 'oficializar_clube') {
        if (usuariosCriandoTopico.has(interaction.user.id)) {
            await interaction.reply({ content: '⏳ Seu tópico já está sendo criado, aguarde.', flags: MessageFlags.Ephemeral }).catch(() => {});
            return;
        }
        usuariosCriandoTopico.add(interaction.user.id);

        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const topicoExistente = await usuarioJaTemTopicoAberto(interaction.channel, interaction.user);
            if (topicoExistente) {
                await interaction.editReply(`❌ Você já tem um tópico aberto: ${topicoExistente}`);
                return;
            }

            const topico = await interaction.channel.threads.create({
                name: interaction.user.username,
                type: ChannelType.PublicThread,
                reason: `Novo pedido de oficialização de clube aberto por ${interaction.user.tag}`
            });
            registrarTopicoAberto(interaction.channel, interaction.user, topico);
            registrarDadosDoTopico(topico, interaction.user);

            await topico.members.add(interaction.user.id);

            try {
                const mensagens = await interaction.channel.messages.fetch({ limit: 5 });
                const msgSistema = mensagens.find(m => m.type === MessageType.ThreadCreated);
                if (msgSistema) await msgSistema.delete();
            } catch (erroSistema) {
                console.error('Não consegui apagar o aviso de tópico criado:', erroSistema);
            }

            const embedAguardar = new EmbedBuilder()
                .setColor(COR_OFICIALIZAR_CLUBE)
                .setDescription('Aguarde até, que um responsável venha te atender.');

            await topico.send({ content: `<@${interaction.user.id}> <@&${CARGO_ATENDIMENTO_ID}>`, embeds: [embedAguardar], components: componentesTicketAguardando() });

            await interaction.editReply(`Criei um tópico pra você: ${topico}`);
        } catch (error) {
            console.error('Erro ao criar o tópico de oficialização de clube:', error);
            await interaction.editReply('❌ Não foi possível criar o tópico.').catch(() => {});
        } finally {
            usuariosCriandoTopico.delete(interaction.user.id);
        }
        return;
    }

    if (interaction.isButton() && interaction.customId === 'cargos_registro') {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const registro = criarRegistroCargosVazio();
            registroCargosEmAndamento.set(interaction.user.id, registro);

            await interaction.deleteReply().catch(() => {});
            await enviarEtapaRegistroCargos(interaction, ORDEM_CATEGORIAS_CARGOS[0], registro);
        } catch (error) {
            console.error('Erro ao iniciar registro de cargos:', error);
            await interaction.editReply('❌ Não foi possível iniciar o registro de cargos.').catch(() => {});
        }
        return;
    }

    if (interaction.isButton() && interaction.customId.startsWith('cargo_botao_')) {
        const partes = interaction.customId.split('_');
        const categoria = partes[2];
        const roleId = partes[3];
        const config = CONFIG_CATEGORIAS_CARGOS[categoria];

        if (!config) {
            console.error(`[cargos] Categoria desconhecida no customId: ${interaction.customId}`);
            return;
        }

        try {
            const idsDoGrupo = config.grupo.map(o => o.id);
            const registro = obterOuCriarRegistroCargos(interaction.user.id);

            if (config.exclusivo) {
                await sincronizarCargosDoGrupo(interaction.member, idsDoGrupo, [roleId]);
                registro.escolhas[categoria] = roleId;

                await interaction.deferUpdate();
                await interaction.deleteReply().catch(() => {});

                const indiceAtual = ORDEM_CATEGORIAS_CARGOS.indexOf(categoria);
                const proximaCategoria = ORDEM_CATEGORIAS_CARGOS[indiceAtual + 1];
                if (proximaCategoria) {
                    await enviarEtapaRegistroCargos(interaction, proximaCategoria, registro);
                }
            }
        } catch (error) {
            console.error(`Erro ao atualizar cargo (categoria ${categoria}):`, error);
            const mensagemErro = '❌ Não foi possível atualizar seu cargo. Verifique se o bot tem permissão (cargo do bot precisa estar ACIMA desses cargos na lista de cargos do servidor).';
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: mensagemErro, flags: MessageFlags.Ephemeral }).catch(() => {});
            } else {
                await interaction.reply({ content: mensagemErro, flags: MessageFlags.Ephemeral }).catch(() => {});
            }
        }
        return;
    }

    if (interaction.isButton() && interaction.customId.startsWith('cargo_pular_')) {
        const categoria = interaction.customId.replace('cargo_pular_', '');
        if (!CONFIG_CATEGORIAS_CARGOS[categoria]) return;

        try {
            const registro = obterOuCriarRegistroCargos(interaction.user.id);
            const indiceAtual = ORDEM_CATEGORIAS_CARGOS.indexOf(categoria);
            const proximaCategoria = ORDEM_CATEGORIAS_CARGOS[indiceAtual + 1];

            await interaction.deferUpdate();
            await interaction.deleteReply().catch(() => {});

            if (proximaCategoria) {
                await enviarEtapaRegistroCargos(interaction, proximaCategoria, registro);
            } else {
                registroCargosEmAndamento.delete(interaction.user.id);
                await interaction.followUp({
                    content: '✅ Registro concluído sem alterar esta etapa.',
                    flags: MessageFlags.Ephemeral
                });
            }
        } catch (error) {
            console.error(`Erro ao pular etapa de cargos (${categoria}):`, error);
        }
        return;
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'cargo_select_pings') {
        try {
            const idsDoGrupo = GRUPO_PINGS.map(o => o.id);
            await sincronizarCargosDoGrupo(interaction.member, idsDoGrupo, interaction.values);

            const registro = obterOuCriarRegistroCargos(interaction.user.id);
            const membroAtualizado = await interaction.guild.members.fetch(interaction.user.id);
            const embedAtualizado = montarEmbedEtapaCargos('pings', registro, membroAtualizado);
            const componentesAtualizados = montarComponentesEtapaPings(membroAtualizado);
            await interaction.update({ embeds: [embedAtualizado], components: componentesAtualizados });
        } catch (error) {
            console.error('Erro ao atualizar pings:', error);
            const mensagemErro = '❌ Não foi possível atualizar seus pings.';
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: mensagemErro, flags: MessageFlags.Ephemeral }).catch(() => {});
            } else {
                await interaction.reply({ content: mensagemErro, flags: MessageFlags.Ephemeral }).catch(() => {});
            }
        }
        return;
    }

    if (interaction.isButton() && interaction.customId === 'cargo_concluir_pings') {
        try {
            await interaction.deferUpdate();
            await interaction.deleteReply().catch(() => {});

            registroCargosEmAndamento.delete(interaction.user.id);

            await interaction.followUp({
                content: '✅ Registro concluído! Seus cargos foram atualizados.',
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error('Erro ao concluir registro de cargos:', error);
        }
        return;
    }

    if (interaction.isButton() && interaction.customId === 'cargos_apagar') {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const todosOsIdsDeCargos = [
                ...GRUPO_TROFEUS,
                ...GRUPO_RANQUEADA,
                ...GRUPO_GENERO,
                ...GRUPO_IDADE,
                ...GRUPO_REGIAO,
                ...GRUPO_PINGS
            ].map(opcao => opcao.id);

            const cargosQueTem = todosOsIdsDeCargos.filter(id => interaction.member.roles.cache.has(id));

            if (cargosQueTem.length === 0) {
                await interaction.editReply('ℹ️ Você não tinha nenhum desses cargos.');
                return;
            }

            await interaction.member.roles.remove(cargosQueTem, 'Botão Apagar Cargos');
            await interaction.editReply(`✅ Removi ${cargosQueTem.length} cargo(s) do seu perfil.`);
        } catch (error) {
            console.error('Erro ao apagar cargos:', error);
            await interaction.editReply('❌ Não foi possível apagar seus cargos. Verifique se o bot tem permissão (cargo do bot precisa estar ACIMA desses cargos na lista de cargos do servidor).').catch(() => {});
        }
        return;
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'suporte_menu') {
        const escolha = interaction.values[0];
        const tipo = escolha === 'duvida' ? 'Dúvida' : 'Denúncia';

        if (usuariosCriandoTopico.has(interaction.user.id)) {
            await interaction.reply({ content: '⏳ Seu tópico já está sendo criado, aguarde.', flags: MessageFlags.Ephemeral }).catch(() => {});
            return;
        }
        usuariosCriandoTopico.add(interaction.user.id);

        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const topicoExistente = await usuarioJaTemTopicoAberto(interaction.channel, interaction.user);
            if (topicoExistente) {
                await interaction.editReply(`❌ Você já tem um tópico aberto: ${topicoExistente}`);
                return;
            }

            const topico = await interaction.channel.threads.create({
                name: interaction.user.username,
                type: ChannelType.PublicThread,
                reason: `Novo atendimento (${tipo}) aberto por ${interaction.user.tag}`
            });
            registrarTopicoAberto(interaction.channel, interaction.user, topico);
            registrarDadosDoTopico(topico, interaction.user);

            await topico.members.add(interaction.user.id);

            try {
                await interaction.guild.members.fetch();
                const cargoAtendimento = interaction.guild.roles.cache.get(CARGO_ATENDIMENTO_ID);
                if (cargoAtendimento) {
                    for (const membroCargo of cargoAtendimento.members.values()) {
                        if (membroCargo.id !== interaction.user.id) {
                            await topico.members.add(membroCargo.id).catch(() => {});
                        }
                    }
                } else {
                    console.error(`Cargo de atendimento (${CARGO_ATENDIMENTO_ID}) não encontrado.`);
                }
            } catch (erroCargo) {
                console.error('Erro ao adicionar cargo de atendimento no tópico:', erroCargo);
            }

            const embedTopico = new EmbedBuilder()
                .setColor(COR_EMBED)
                .setDescription(
                    `Olá, <@${interaction.user.id}>! Este tópico foi aberto para atendimento de **${tipo}**.\n` +
                    `Descreva com detalhes o que você precisa para que a equipe possa te ajudar.`
                );

            await topico.send({ content: `<@${interaction.user.id}> <@&${CARGO_ATENDIMENTO_ID}>`, embeds: [embedTopico], components: componentesTicketAguardando() });

            try {
                const mensagens = await interaction.channel.messages.fetch({ limit: 5 });
                const msgSistema = mensagens.find(m => m.type === MessageType.ThreadCreated);
                if (msgSistema) await msgSistema.delete();
            } catch (erroSistema) {
                console.error('Não consegui apagar o aviso de tópico criado:', erroSistema);
            }

            await interaction.editReply(`Criei um tópico pra você: ${topico}`);
        } catch (error) {
            console.error('Erro ao criar o tópico:', error);
            await interaction.editReply('❌ Não foi possível criar o tópico.').catch(() => {});
        } finally {
            usuariosCriandoTopico.delete(interaction.user.id);
        }
        return;
    }

    } catch (error) {
        console.error('[interação] Erro ao processar interação:', error);
        const resposta = { content: '❌ Não foi possível processar este comando. Tente novamente.' };
        if (interaction.deferred || interaction.replied) {
            await interaction.followUp({ ...resposta, flags: MessageFlags.Ephemeral }).catch(() => {});
        } else {
            await interaction.reply({ ...resposta, flags: MessageFlags.Ephemeral }).catch(() => {});
        }
    }
});
}

// Funções compartilhadas com o módulo de mensagens.
async function tratarViolacaoAutoMod(mensagem, motivo, notificarNoCanal) {
    idsApagadosPeloAutoMod.add(mensagem.id);

    try {
        await mensagem.delete();
    } catch (error) {
        console.error('[auto-mod] Erro ao apagar mensagem:', error);
    }

    if (notificarNoCanal) {
        try {
            const aviso = await mensagem.channel.send(
                `⚠️ <@${mensagem.author.id}>, sua mensagem foi removida (${motivo}).`
            );
            setTimeout(() => aviso.delete().catch(() => {}), 6000);
        } catch (error) {
            console.error('[auto-mod] Erro ao mandar aviso no canal:', error);
        }
    }

    try {
        const canalAutoMod = mensagem.guild.channels.cache.get(CANAL_LOG_AUTOMOD_ID);
        if (!canalAutoMod) {
            console.error('[auto-mod] Canal de log não encontrado. Verifique CANAL_LOG_AUTOMOD_ID.');
            return;
        }

        const embedAutoMod = new EmbedBuilder()
            .setColor(COR_LOG_AUTOMOD)
            .setAuthor({ name: mensagem.author.tag, iconURL: mensagem.author.displayAvatarURL() })
            .setThumbnail(mensagem.author.displayAvatarURL({ extension: 'png', size: 256 }))
            .setTitle('🚫 Mensagem removida pelo Auto-Mod')
            .addFields(
                { name: 'Motivo', value: motivo },
                { name: 'Canal', value: `${mensagem.channel}`, inline: true },
                { name: 'Conteúdo', value: limitarCampoEmbed(mensagem.content || '*(vazio — só anexo/imagem)*') }
            )
            .setFooter({ text: `ID do usuário: ${mensagem.author.id}` })
            .setTimestamp();

        await canalAutoMod.send({ embeds: [embedAutoMod] });
    } catch (error) {
        console.error('[auto-mod] Erro ao logar violação:', error);
    }
}

function usuarioEstaSpammando(usuarioId) {
    const agora = Date.now();
    const timestamps = (mensagensRecentesPorUsuario.get(usuarioId) ?? []).filter(t => agora - t < JANELA_SPAM_MS);
    timestamps.push(agora);
    mensagensRecentesPorUsuario.set(usuarioId, timestamps);
    return timestamps.length > LIMITE_SPAM_MENSAGENS;
}

// Auto-mod (agora gerenciado pelos módulos em src/events)

if (!USAR_EVENTOS_MODULARES) {

const CANAL_REACOES_REPLAY_BRAWL_ID = 'SEU_ID_CANAL_REPLAY_BRAWL';
const EMOJIS_REACAO_REPLAY_BRAWL = [
    'SEU_EMOJI_REPLAY_1',
    'SEU_EMOJI_REPLAY_2'
];

client.on('messageCreate', async mensagem => {
    if (mensagem.channelId !== CANAL_REACOES_REPLAY_BRAWL_ID) return;

    const resultados = await Promise.allSettled(
        EMOJIS_REACAO_REPLAY_BRAWL.map(emojiId => mensagem.react(emojiId))
    );
    for (const resultado of resultados) {
        if (resultado.status === 'rejected') {
            console.error('[reacoes] Erro ao reagir no canal Replay Brawl:', resultado.reason);
        }
    }
});

// Sistema de cópia e reenvio de mensagens nos canais de notícias e parcerias
const CANAIS_COM_REENVIO = {
    [CANAL_NOTICIAS_STARS_ID]: { cargo: CARGO_PING_CALL_ID, nome: 'Notícias Stars' },
    [CANAL_PARCERIAS_NOTIF_ID]: { cargo: CARGO_PING_PARCERIAS_NOTIF_ID, nome: 'Parcerias' }
};

client.on('messageCreate', async mensagem => {
    try {
        // Verifica se é um dos canais que precisa reenviar
        if (!CANAIS_COM_REENVIO[mensagem.channelId]) return;
        if (mensagem.author.bot) return;
        if (!mensagem.guild) return;

        const config = CANAIS_COM_REENVIO[mensagem.channelId];
        const conteudo = mensagem.content || '';
        const attachments = [...mensagem.attachments.values()];
        const link = (conteudo.match(/https?:\/\/[^\s]+/i) || conteudo.match(/discord(?:app)?\.gg\/[^\s]+/i) || [null])[0];
        const linkExibicao = link || '';

        function extrairIdYoutube(url) {
            if (!url) return null;
            try {
                const parsed = new URL(url);
                const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();

                if (host === 'youtu.be') {
                    return parsed.pathname.slice(1).split(/[/?#]/)[0] || null;
                }

                if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
                    const id = parsed.searchParams.get('v');
                    if (id) return id;
                    const shortsMatch = parsed.pathname.match(/^\/shorts\/([^/?#]+)/i);
                    if (shortsMatch) return shortsMatch[1];
                    const embedMatch = parsed.pathname.match(/^\/embed\/([^/?#]+)/i);
                    if (embedMatch) return embedMatch[1];
                }
            } catch {
                return null;
            }

            return null;
        }

        const imagensAnexos = attachments.filter(arquivo =>
            /\.(png|jpe?g|gif|webp|avif|bmp|svg)(\?.*)?$/i.test(arquivo.url)
        );

        const imagensUrlDoTexto = (conteudo.match(/https?:\/\/[^\s]+\.(png|jpe?g|gif|webp|avif|bmp|svg)(\?.*)?/gi) || []).filter(Boolean);
        const imagensUrls = [...imagensAnexos.map(arquivo => arquivo.url), ...imagensUrlDoTexto];
        const primeiraImagemUrl = imagensUrls[0] || null;

        const idYoutube = extrairIdYoutube(linkExibicao);
        const thumbnailYoutube = idYoutube ? `https://img.youtube.com/vi/${idYoutube}/maxresdefault.jpg` : null;
        const imagemFinal = primeiraImagemUrl || thumbnailYoutube;

        const embedReenvio = new EmbedBuilder()
            .setColor(0x00FFFF)
            .setDescription(conteudo || '*(sem texto — só anexo/embed)*')
            .setTimestamp();

        if (imagemFinal) {
            embedReenvio.setImage(imagemFinal);
        }

        const mensagemTexto = `<@&${config.cargo}>`;

        const componentes = linkExibicao ? [new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Entrar no servidor')
                .setStyle(ButtonStyle.Link)
                .setURL(linkExibicao)
        )] : [];

        const arquivosParaEnviar = imagensAnexos.length > 0 ? attachments : attachments;

        const mensagemReenviada = await mensagem.channel.send({
            content: mensagemTexto || undefined,
            embeds: [embedReenvio],
            components: componentes,
            files: arquivosParaEnviar,
            allowedMentions: { roles: [config.cargo] }
        }).catch(error => {
            console.error(`[copy-paste] Erro ao reenviar mensagem no canal ${config.nome}:`, error);
            return null;
        });

        if (!mensagemReenviada) return;

        // Apaga a mensagem original após 1 segundo
        setTimeout(() => {
            mensagem.delete().catch(error => {
                console.error(`[copy-paste] Erro ao apagar mensagem original no canal ${config.nome}:`, error);
            });
        }, 1000);
    } catch (error) {
        console.error('[copy-paste] Erro ao processar mensagem:', error);
    }
});

// Registra mensagens e atualiza as estatísticas persistentes.
client.on('messageCreate', mensagem => {
    if (!mensagem.guild || mensagem.author.bot) return;

    const mensagensAntigas = obterTotaisServidor(mensagem.guild.id).mensagens;
    const perfil = obterEstatisticasPerfil(mensagem.author.id);
    perfil.mensagens++;
    registrarMensagemStatus(mensagem.guild.id, mensagem.author.id, mensagem.channelId);
    const mensagensNovas = obterTotaisServidor(mensagem.guild.id).mensagens;
    console.log(`[mensagens] Servidor ${mensagem.guild.id} mensagens totais guardadas: ${mensagensAntigas} > ${mensagensNovas}`);
    verificarRecompensaMensagens(mensagem.guild, mensagem.author, mensagem.channel);
    salvarEstadoPerfis();
});

// Remove e registra mensagens bloqueadas pelo auto-mod.
async function tratarViolacaoAutoMod(mensagem, motivo, notificarNoCanal) {
    idsApagadosPeloAutoMod.add(mensagem.id);

    try {
        await mensagem.delete();
    } catch (error) {
        console.error('[auto-mod] Erro ao apagar mensagem:', error);
    }

    if (notificarNoCanal) {
        try {
            const aviso = await mensagem.channel.send(
                `⚠️ <@${mensagem.author.id}>, sua mensagem foi removida (${motivo}).`
            );
            setTimeout(() => aviso.delete().catch(() => {}), 6000);
        } catch (error) {
            console.error('[auto-mod] Erro ao mandar aviso no canal:', error);
        }
    }

    try {
        const canalAutoMod = mensagem.guild.channels.cache.get(CANAL_LOG_AUTOMOD_ID);
        if (!canalAutoMod) {
            console.error('[auto-mod] Canal de log não encontrado. Verifique CANAL_LOG_AUTOMOD_ID.');
            return;
        }

        const embedAutoMod = new EmbedBuilder()
            .setColor(COR_LOG_AUTOMOD)
            .setAuthor({ name: mensagem.author.tag, iconURL: mensagem.author.displayAvatarURL() })
            .setThumbnail(mensagem.author.displayAvatarURL({ extension: 'png', size: 256 }))
            .setTitle('🚫 Mensagem removida pelo Auto-Mod')
            .addFields(
                { name: 'Motivo', value: motivo },
                { name: 'Canal', value: `${mensagem.channel}`, inline: true },
                { name: 'Conteúdo', value: limitarCampoEmbed(mensagem.content || '*(vazio — só anexo/imagem)*') }
            )
            .setFooter({ text: `ID do usuário: ${mensagem.author.id}` })
            .setTimestamp();

        await canalAutoMod.send({ embeds: [embedAutoMod] });
    } catch (error) {
        console.error('[auto-mod] Erro ao logar violação:', error);
    }
}

// Verifica se o usuário excedeu o limite de spam.
function usuarioEstaSpammando(usuarioId) {
    const agora = Date.now();
    const timestamps = (mensagensRecentesPorUsuario.get(usuarioId) ?? []).filter(t => agora - t < JANELA_SPAM_MS);
    timestamps.push(agora);
    mensagensRecentesPorUsuario.set(usuarioId, timestamps);
    return timestamps.length > LIMITE_SPAM_MENSAGENS;
}

// Aplica filtros automáticos nas mensagens.
client.on('messageCreate', async mensagem => {
    try {
        if (mensagem.author.bot) return;
        if (!mensagem.guild) return;
        if (mensagem.channelId === CANAL_LOG_AUTOMOD_ID) return;

        const ehIsento = mensagem.member?.roles.cache.some(cargo => CARGOS_ISENTOS_AUTOMOD_IDS.includes(cargo.id));

        console.log(`[auto-mod] mensagem de ${mensagem.author.tag} | isento: ${!!ehIsento} | conteúdo: "${mensagem.content}"`);

        if (ehIsento) return;

        if (REGEX_CONVITE_DISCORD.test(mensagem.content)) {
            await tratarViolacaoAutoMod(mensagem, 'Link de convite de outro servidor', true);
            return;
        }

        if (REGEX_PALAVRAS_BLOQUEADAS.test(normalizarTexto(mensagem.content))) {
            await tratarViolacaoAutoMod(mensagem, 'Termo bloqueado', false);
            return;
        }

        if (usuarioEstaSpammando(mensagem.author.id)) {
            await tratarViolacaoAutoMod(mensagem, 'Spam (mensagens muito rápidas)', true);
            return;
        }
    } catch (error) {
        console.error('Erro no auto-mod:', error);
    }
});

}

// Logs (agora gerenciados pelo módulo de mensagens)

if (!USAR_EVENTOS_MODULARES) {

// Registra mensagens enviadas no canal de logs.
client.on('messageCreate', async mensagem => {
    if (mensagem.author.bot) return;
    if (!mensagem.guild) return;
    if (mensagem.channelId === CANAL_LOGS_ID) return;
    if (jaProcessadoRecentemente(`log_enviada_${mensagem.id}`)) return;

    try {
        const canalLogs = mensagem.guild.channels.cache.get(CANAL_LOGS_ID);
        if (!canalLogs) {
            console.error('[log-mensagens] Canal de logs não encontrado. Verifique CANAL_LOGS_ID.');
            return;
        }

        const embedLog = new EmbedBuilder()
            .setColor(COR_LOG_ENVIADA)
            .setAuthor({ name: mensagem.author.tag, iconURL: mensagem.author.displayAvatarURL() })
            .setThumbnail(mensagem.author.displayAvatarURL({ extension: 'png', size: 256 }))
            .setDescription(mensagem.content || '*(sem texto — só anexo/imagem/embed)*')
            .addFields({ name: 'Canal', value: `${mensagem.channel}`, inline: true })
            .setFooter({ text: `ID do usuário: ${mensagem.author.id}` })
            .setTimestamp();

        await canalLogs.send({ embeds: [embedLog] });
    } catch (error) {
        console.error('Erro ao logar mensagem enviada:', error);
    }
});

// Registra edições de mensagens no canal de logs.
client.on('messageUpdate', async (mensagemAntiga, mensagemNova) => {
    try {
        if (mensagemNova.partial) await mensagemNova.fetch();
    } catch {
    }

    if (mensagemNova.author?.bot) return;
    if (!mensagemNova.guild) return;
    if (mensagemNova.channelId === CANAL_LOGS_ID) return;
    if (mensagemAntiga.content === mensagemNova.content) return;
    if (jaProcessadoRecentemente(`log_editada_${mensagemNova.id}_${mensagemNova.editedTimestamp}`)) return;

    try {
        const canalLogs = mensagemNova.guild.channels.cache.get(CANAL_LOGS_ID);
        if (!canalLogs) {
            console.error('[log-mensagens] Canal de logs não encontrado. Verifique CANAL_LOGS_ID.');
            return;
        }

        const conteudoAntigo = mensagemAntiga.partial
            ? '*(não disponível — mensagem não estava em cache)*'
            : (mensagemAntiga.content || '*(vazio)*');

        const embedLog = new EmbedBuilder()
            .setColor(COR_LOG_EDITADA)
            .setAuthor({ name: mensagemNova.author.tag, iconURL: mensagemNova.author.displayAvatarURL() })
            .setThumbnail(mensagemNova.author.displayAvatarURL({ extension: 'png', size: 256 }))
            .addFields(
                { name: 'Antes', value: limitarCampoEmbed(conteudoAntigo) },
                { name: 'Depois', value: limitarCampoEmbed(mensagemNova.content || '*(vazio)*') },
                { name: 'Canal', value: `${mensagemNova.channel}`, inline: true }
            )
            .setFooter({ text: `ID do usuário: ${mensagemNova.author.id}` })
            .setTimestamp();

        await canalLogs.send({ embeds: [embedLog] });
    } catch (error) {
        console.error('Erro ao logar mensagem editada:', error);
    }
});

// Registra exclusões de mensagens no canal de logs.
client.on('messageDelete', async mensagem => {
    try {
        if (mensagem.partial) await mensagem.fetch();
    } catch {
    }

    if (mensagem.author?.bot) return;
    if (!mensagem.guild) return;
    if (mensagem.channelId === CANAL_LOGS_ID) return;

    if (idsApagadosPeloAutoMod.has(mensagem.id)) {
        idsApagadosPeloAutoMod.delete(mensagem.id);
        return;
    }
    if (jaProcessadoRecentemente(`log_apagada_${mensagem.id}`)) return;

    try {
        const canalLogs = mensagem.guild.channels.cache.get(CANAL_LOGS_ID);
        if (!canalLogs) {
            console.error('[log-mensagens] Canal de logs não encontrado. Verifique CANAL_LOGS_ID.');
            return;
        }

        const embedLog = new EmbedBuilder()
            .setColor(COR_LOG_APAGADA)
            .setAuthor({
                name: mensagem.author?.tag ?? 'Autor desconhecido',
                iconURL: mensagem.author?.displayAvatarURL()
            })
            .setThumbnail(mensagem.author?.displayAvatarURL({ extension: 'png', size: 256 }) ?? null)
            .setDescription(mensagem.content || '*(conteúdo não disponível — mensagem não estava em cache)*')
            .addFields({ name: 'Canal', value: `${mensagem.channel}`, inline: true })
            .setFooter({ text: mensagem.author ? `ID do usuário: ${mensagem.author.id}` : 'ID desconhecido' })
            .setTimestamp();

        await canalLogs.send({ embeds: [embedLog] });
    } catch (error) {
        console.error('Erro ao logar mensagem apagada:', error);
    }
});

client.on('channelCreate', async (channel) => {
    if (!channel?.guild) return;

    const executor = await obterExecutorCanal(channel.guild, AuditLogEvent.ChannelCreate, channel.id);
    await enviarLogCanal(channel.guild, {
        titulo: '✅ Canal criado',
        cor: 0x2ECC71,
        descricao: `Um ${formatarTipoCanal(channel).toLowerCase()} foi criado no servidor.`,
        channel,
        executor
    });
});

client.on('channelUpdate', async (oldChannel, newChannel) => {
    if (!newChannel?.guild || oldChannel.name === newChannel.name) return;

    const executor = await obterExecutorCanal(newChannel.guild, AuditLogEvent.ChannelUpdate, newChannel.id);
    await enviarLogCanal(newChannel.guild, {
        titulo: '🟡 Canal/modificação',
        cor: 0xF1C40F,
        descricao: `O nome do ${formatarTipoCanal(newChannel).toLowerCase()} foi alterado de **${oldChannel.name}** para **${newChannel.name}**.`,
        channel: newChannel,
        executor
    });
});

client.on('channelDelete', async (channel) => {
    if (!channel?.guild) return;

    const executor = await obterExecutorCanal(channel.guild, AuditLogEvent.ChannelDelete, channel.id);
    await enviarLogCanal(channel.guild, {
        titulo: '❌ Canal excluído',
        cor: 0xE74C3C,
        descricao: `O ${formatarTipoCanal(channel).toLowerCase()} **${channel.name}** foi excluído.`,
        channel,
        executor
    });
});

client.on('roleCreate', async (role) => {
    if (!role?.guild) return;

    const executor = await obterExecutorCanal(role.guild, AuditLogEvent.RoleCreate, role.id);
    await enviarLogCargo(role.guild, {
        titulo: '✅ Cargo criado',
        cor: 0x2ECC71,
        descricao: `O cargo **${role.name}** foi criado.`,
        role,
        executor
    });
});

client.on('roleUpdate', async (oldRole, newRole) => {
    if (!newRole?.guild || oldRole.name === newRole.name) return;

    const executor = await obterExecutorCanal(newRole.guild, AuditLogEvent.RoleUpdate, newRole.id);
    await enviarLogCargo(newRole.guild, {
        titulo: '🟡 Cargo modificado',
        cor: 0xF1C40F,
        descricao: `O cargo **${oldRole.name}** foi renomeado para **${newRole.name}**.`,
        role: newRole,
        executor
    });
});

client.on('roleDelete', async (role) => {
    if (!role?.guild) return;

    const executor = await obterExecutorCanal(role.guild, AuditLogEvent.RoleDelete, role.id);
    await enviarLogCargo(role.guild, {
        titulo: '❌ Cargo excluído',
        cor: 0xE74C3C,
        descricao: `O cargo **${role.name}** foi excluído.`,
        role,
        executor
    });
});

// Registra mudanças e gerencia calls temporárias.
client.on('voiceStateUpdate', async (oldState, newState) => {
    if (oldState.channelId !== newState.channelId) {
        const membroDoEvento = newState.member ?? oldState.member;
        const chaveDedupVoz = `voz_${membroDoEvento?.id}_${newState.sessionId ?? oldState.sessionId ?? ''}_${oldState.channelId ?? 'null'}_${newState.channelId ?? 'null'}`;
        if (jaProcessadoRecentemente(chaveDedupVoz)) return;
    }

    const membro = newState.member ?? oldState.member;
    if (membro && !membro.user.bot && oldState.channelId !== newState.channelId) {
        const usuarioId = membro.id;
        const agora = Date.now();
        const sessao = sessoesDeVoz.get(usuarioId);

        if (sessao) {
            acumularTempoSessaoVoz(usuarioId, sessao, agora);
            sessoesDeVoz.delete(usuarioId);
            delete estadoSessoesVoz[usuarioId];
        }

        if (newState.channelId) {
            const sessaoNova = {
                inicio: agora,
                canalId: newState.channelId,
                guildId: newState.guild.id
            };
            sessoesDeVoz.set(usuarioId, sessaoNova);
            estadoSessoesVoz[usuarioId] = sessaoNova;
        }
        salvarEstadoPerfis();
    }

    try {
        if (membro && !membro.user.bot && oldState.channelId !== newState.channelId) {
            const guild = newState.guild ?? oldState.guild;
            const canalLogCalls = guild.channels.cache.get(CANAL_LOG_CALLS_ID);

            if (!canalLogCalls) {
                console.error('[log-calls] Canal de logs não encontrado. Verifique CANAL_LOG_CALLS_ID.');
            } else {
                let cor, titulo, descricao;

                if (!oldState.channelId && newState.channelId) {
                    cor = COR_LOG_CALL_ENTROU;
                    titulo = '🔊 Entrou na call';
                    descricao = `Entrou em ${newState.channel}`;
                } else if (oldState.channelId && !newState.channelId) {
                    cor = COR_LOG_CALL_SAIU;
                    titulo = '🔇 Saiu da call';
                    descricao = `Saiu de ${oldState.channel}`;
                } else {
                    cor = COR_LOG_CALL_TROCOU;
                    titulo = '🔁 Trocou de call';
                    descricao = `De ${oldState.channel} para ${newState.channel}`;
                }

                const embedLogCall = new EmbedBuilder()
                    .setColor(cor)
                    .setAuthor({ name: membro.user.tag, iconURL: membro.user.displayAvatarURL() })
                    .setThumbnail(membro.user.displayAvatarURL({ extension: 'png', size: 256 }))
                    .setTitle(titulo)
                    .setDescription(descricao)
                    .setFooter({ text: `ID do usuário: ${membro.id}` })
                    .setTimestamp();

                await canalLogCalls.send({ embeds: [embedLogCall] });
            }
        }
    } catch (error) {
        console.error('Erro ao logar call:', error);
    }

    if (oldState.channelId && oldState.channelId !== newState.channelId && callsCriadas.has(oldState.channelId)) {
        const canalAntigo = oldState.channel;
        if (canalAntigo && canalAntigo.members.size === 0) {
            callsCriadas.delete(canalAntigo.id);
            try {
                await canalAntigo.delete('Call temporária vazia');
            } catch (error) {
                console.error('Erro ao apagar call vazia:', error);
            }
        }
    }

    const hub = HUBS_DE_CALL.find(h => h.canalHubId === newState.channelId);
    if (hub && oldState.channelId !== newState.channelId) {
        const membro = newState.member;
        const canalHub = newState.channel;

        try {
            const novaCall = await canalHub.guild.channels.create({
                name: `${hub.emoji} call ${membro.displayName}`,
                type: ChannelType.GuildVoice,
                parent: canalHub.parentId ?? undefined,
                userLimit: LIMITE_CALL_CRIADA
            });

            callsCriadas.add(novaCall.id);
            await membro.voice.setChannel(novaCall);
        } catch (error) {
            console.error('Erro ao criar call automática:', error);
        }
    }
});

}

const botState = {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ChannelType,
    MessageType,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    MessageFlags,
    AuditLogEvent,
    CARGOS_AUTORIZADOS_DECISAO_PUNICAO,
    CARGOS_AUTORIZADOS_ASSUMIR_TICKET,
    CARGOS_AUTORIZADOS_REC,
    CARGOS_EQUIPE,
    CARGO_OWNER_ID,
    CARGO_SUB_OWNER_ID: 'SEU_ID_CARGO_SUB_OWNER',
    CANAL_LOG_PUNICOES_ID,
    CANAL_LOG_BANS_ID,
    CANAL_LOG_AUTOMOD_ID,
    CANAL_LOGS_ID,
    CANAL_LOG_CALLS_ID,
    REGEX_CONVITE_DISCORD,
    REGEX_PALAVRAS_BLOQUEADAS,
    normalizarTexto,
    tratarViolacaoAutoMod,
    usuarioEstaSpammando,
    idsApagadosPeloAutoMod,
    jaProcessadoRecentemente,
    obterEstatisticasPerfil,
    registrarMensagemStatus,
    obterTotaisServidor,
    verificarRecompensaMensagens,
    salvarEstadoPerfis,
    adicionarTempoDeVoz,
    registrarIntervaloVozStatus,
    verificarRecompensaCall,
    montarEmbedStatus,
    CARGO_MARCAR_PUNICOES_ID,
    CARGOS_ISENTOS_AUTOMOD_IDS,
    dadosDosTopicos,
    componentesTicketAssumido,
    obterDadosTicket,
    registrarEFecharTopico,
    agendarAtualizacaoContadorBoosters,
    removerCargosExpirados,
    registrarPunicao,
    BANIMENTOS_APROVADOS_PELO_BOT,
    callsCriadas,
    HUBS_DE_CALL,
    LIMITE_CALL_CRIADA,
    sessoesDeVoz,
    estadoSessoesVoz,
    COR_LOG_ENVIADA,
    COR_LOG_EDITADA,
    COR_LOG_APAGADA,
    COR_LOG_CALL_ENTROU,
    COR_LOG_CALL_SAIU,
    COR_LOG_CALL_TROCOU,
    CARGO_NOVO_MEMBRO_ID,
    CARGO_STAFF_ID,
    CARGO_OWNER_ID,
    CANAL_ENTRADA_AUTOMATICA_ID,
    CATEGORIA_CALLS_PERSONALIZADAS_ID,
    CANAL_BOAS_VINDAS_ID,
    CANAL_CHAT_NOVO_MEMBRO_ID,
    CANAL_CARGOS_ID,
    CANAL_REGRAS_ID,
    CANAL_SUPORTE_ID,
    CANAL_LOG_TICKETS_ID,
    CANAL_BOOSTERS_ID,
    CARGO_BOOSTER_ID,
    EMOJI_1_ID,
    EMOJI_3_ID,
    COR_BOAS_VINDAS,
    CARGOS_LOJA,
    DURACAO_CARGO_COMPRA_MS,
    obterContaEconomia,
    obterComprasUsuario,
    obterBeneficiosUsuario,
    consumirBeneficio,
    consumirVmuteDisponivel,
    temVmuteDisponivel,
    obterCargoComBeneficioDisponivel,
    listarCargosPersonalizados,
    registrarCargoPersonalizado,
    listarCallsPersonalizadas,
    registrarCallPersonalizada,
    montarConfiguracaoBeneficios,
    montarDescricaoLojaCargos,
    montarEmbedBau,
    lerEstadoCampeonato,
    salvarEstadoCampeonato,
    montarEmbedCampeonato,
    criarRegistroCargosVazio,
    obterOuCriarRegistroCargos,
    montarEmbedEtapaCargos,
    montarComponentesEtapaPings,
    sincronizarCargosDoGrupo,
    enviarEtapaRegistroCargos,
    usuarioJaTemTopicoAberto,
    registrarTopicoAberto,
    registrarDadosDoTopico,
    usuariosCriandoTopico,
    componentesTicketAguardando,
    componentesTicketAssumido,
    obterDadosTicket,
    registrarEFecharTopico,
    obterEmoji,
    tagDoEmoji,
    linkDoCanal,
    ORDEM_CATEGORIAS_CARGOS,
    CONFIG_CATEGORIAS_CARGOS,
    GRUPO_PINGS,
    GRUPO_TROFEUS,
    GRUPO_RANQUEADA,
    GRUPO_GENERO,
    GRUPO_IDADE,
    GRUPO_REGIAO,
    CARGO_ATENDIMENTO_ID,
    COR_LOJA,
    COR_CAMPEONATO,
    COR_OFICIALIZAR,
    COR_OFICIALIZAR_CLUBE,
    CARGO_MARCAR_PUNICOES_ID,
    EMOJI_GEMA
};

const { startBot } = require('./startup');
startBot(client);