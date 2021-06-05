# Claim Game Discord Bot

[![CircleCI](https://circleci.com/gh/Provinite/claim-game/tree/main.svg?style=svg)](https://circleci.com/gh/Provinite/claim-game)

This repository is for the Claim Game discord bot. Report any bugs over on the issues tab. If you're interested in adding this bot to your server, reach out to prov or AJ (CloverCoin). This is still a beta.

# Migrating

```
yarn knex migrate:latest
```

# Run Locally

Start dev server running the bot. Restarts on source changes.

```
yarn start
```

# ENV Vars

- cc_claim_game_db_url or DATABASE_URL
  - Postgres URI for the database.
- cc_claim_game_db_use_ssl
  - Set to "true" or "false" to enable/disable SSL postgres connection. Defaults to true
- cc_claim_game_discord_token
  - Discord Bot account token
