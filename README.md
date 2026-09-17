# 8-Bit Bot

A lightweight Discord bot built to help manage community activity, automate routine tasks, and keep a server organized without needing everything to be done manually.

It combines moderation, VIP rewards, rankings, events, calls, and internal tools in one place, making it useful for active servers that need more control and less repetitive work.

## Overview

The 8-Bit Bot was designed for communities with a lot of interaction, where moderation, rewards, and day-to-day server maintenance can quickly become time-consuming. Instead of handling everything manually, the bot centralizes key functions and keeps operations smoother and more consistent.

### Included systems

- moderation and punishments
- VIP store and paid benefits
- economy with gems and rewards
- member stats and rankings
- championship and team support
- event and call organization
- automatic welcome flow and role handling

## Features

- automatic welcome messages and role assignment
- VIP shop with temporary benefits
- gem economy with donation and balance tools
- user profile with call hours and activity stats
- moderation tools like mute, ban, and message cleanup
- spam, invite, and blocked-word detection
- temporary call management
- ready-to-use messages for events and promotions
- staff tools for server administration

### Main commands

- `/clear` — delete messages from a channel
- `/ofctime` — update championship scoreboard
- `/mute` — apply a temporary timeout
- `/ban` — ban a user
- `/perfil` — show user info and stats
- `/status` — display server-wide activity summary
- `/rec` — approve a user for staff
- `/bau` — open the reward chest and earn gems
- `/give` and `/remove` — manage gem balances
- `/set` — assign a store role
- `/cargovip` — view VIP benefits
- `/buy` — purchase a role for a period of time
- `/top` — display rankings
- `/doar` — donate gems
- `/gema` — check the current balance

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create the environment file

```bash
cp .env.example .env
```

Then add your Discord bot token:

```env
TOKEN=seu_token_do_discord
```

### 3. Run the bot

```bash
npm start
```

For development mode:

```bash
npm run dev
```

### 4. Quick verification

```bash
npm test
```

## Project structure

- `index.js` — app entry point
- `src/config/env.js` — reads the environment variables
- `src/core/bot.js` — main bot logic
- `src/core/client.js` — Discord client setup
- `src/core/startup.js` — bot login flow
- `src/features/commands.js` — slash commands
- `config/constantes.js` — server configuration and IDs
- `tools/` — helper scripts
- `assets/` — images and banners
- `data/` — persistent bot state

## License

This project was created for personal use and for the server environment it was built for. If reused, it should be adapted carefully and used in a way that respects the rules of the community or server where it is running.
