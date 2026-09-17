# 8-Bit Bot

Esse é um bot de Discord que eu fiz pra ajudar num servidor com várias coisas do dia a dia: moderação, loja, ranking, staff, eventos e algumas automações básicas.

Ele foi pensado pra deixar o trabalho mais rápido e menos manual, sem depender que tudo seja feito à mão.

## O que ele faz

- dá boas-vindas e coloca cargos automaticamente
- gerencia loja VIP e benefícios por tempo
- controla gemas, doações e ranking
- ajuda com campeonato e inscrição de times
- mostra perfil, horas em call e mensagens
- faz moderação com mute, ban e limpeza
- detecta spam, convites e termos bloqueados
- cria e administra calls temporárias
- gera mensagens prontas para eventos e loja

## Comandos principais

- `/clear` — limpa mensagens do canal
- `/ofctime` — atualiza o placar do campeonato
- `/mute` — aplica mute temporário
- `/ban` — bane um usuário
- `/perfil` — mostra informações do usuário
- `/status` — mostra estatísticas do servidor
- `/rec` — aprova alguém pra staff
- `/bau` — abre o baú e ganha gemas
- `/give` e `/remove` — gerencia gemas
- `/set` — define cargo da loja
- `/cargovip` — vê benefícios do VIP
- `/buy` — compra cargo
- `/top` — mostra ranking
- `/doar` — doa gemas
- `/gema` — vê saldo

## Como rodar localmente

1. Instale as dependências:

```bash
npm install
```

2. Crie um arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

3. Preencha com o token do seu bot do Discord:

```env
TOKEN=seu_token_do_discord
```

4. Inicie o projeto:

```bash
npm start
```

Se quiser testar sem abrir a aplicação normalmente:

```bash
npm run dev
```

## Verificação rápida

```bash
npm test
```

## Estrutura do projeto

- `index.js` — ponto de entrada
- `src/config/env.js` — leitura do `.env`
- `src/core/bot.js` — lógica principal do bot
- `src/core/client.js` — configuração do cliente Discord
- `src/core/startup.js` — login do bot
- `src/features/commands.js` — comandos Slash
- `config/constantes.js` — IDs e configurações do servidor
- `tools/` — scripts auxiliares
- `assets/` — imagens e banners
- `data/` — estado do bot

## Aviso importante

Esse projeto usa IDs reais de canais, cargos e mensagens do Discord, então antes de subir no GitHub é importante:

- remover o arquivo `.env`
- apagar dados locais de usuários e estatísticas
- trocar IDs reais por placeholders
- revisar o README antes de publicar

## Licença

Esse código foi feito pra uso pessoal e do servidor em que foi criado. Se quiser reutilizar, vale adaptar com cuidado e respeitar as regras do ambiente em que vai rodar.
