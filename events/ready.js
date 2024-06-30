import { sendAdmin } from '../admin/bot_message.js';
import { authenticate } from '../util/youtube.js';

export const name = 'ready';
export function listener(client) {
    authenticate(['https://www.googleapis.com/auth/youtube'], client);

    sendAdmin(client.users, `${client.shard.ids[0]}번째 샤드에서 ${client.user.tag}이 작동 중입니다.`);
}
