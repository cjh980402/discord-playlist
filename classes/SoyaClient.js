import { Client, IntentsBitField, Options, Partials, ActivityType } from 'discord.js';
import { SQLiteHandler } from './SQLiteHandler.js';

export class SoyaClient extends Client {
    db; // 봇의 데이터베이스
    commands = new Map(); // 명령어 객체 저장용
    queues = new Map(); // 음악기능 정보 저장용
    cooldowns = new Set(); // 중복 명령 방지용

    constructor(dbPath) {
        super({
            retryLimit: 3,
            failIfNotExists: false,
            partials: [Partials.Channel],
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.DirectMessages,
                IntentsBitField.Flags.MessageContent
            ],
            presence: { activities: [{ name: '/add 및 /show', type: ActivityType.Listening }] },
            sweepers: {
                guildMembers: {
                    interval: 3600,
                    filter: () => (v) => v.id !== v.client.user.id && !v.voice.channelId
                },
                voiceStates: {
                    interval: 3600,
                    filter: () => (v) => v.id !== v.client.user.id && !v.channelId
                }
            },
            makeCache: Options.cacheWithLimits({
                ApplicationCommandManager: 0,
                BaseGuildEmojiManager: 0,
                GuildEmojiManager: 0,
                GuildBanManager: 0,
                GuildInviteManager: 0,
                GuildScheduledEventManager: 0,
                GuildStickerManager: 0,
                MessageManager: 0,
                PresenceManager: 0,
                ReactionManager: 0,
                ReactionUserManager: 0,
                StageInstanceManager: 0,
                ThreadManager: 0,
                ThreadMemberManager: 0,
                UserManager: 0
            })
        });

        this.db = new SQLiteHandler(dbPath);
    }

    async start() {
        this.db.run(
            'CREATE TABLE IF NOT EXISTS guild_playlist(id integer primary key autoincrement, guild_id text, channel_id text, list_id text)'
        );

        await this.login();
    }

    async createCommand() {
        if (this.application.partial) {
            await this.application.fetch();
        }

        await this.application.commands.set([...this.commands.values()].map((cmd) => cmd.commandData));
    }
}
