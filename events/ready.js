import { sendAdmin } from '../admin/bot_message.js';
import { authenticate } from '../util/youtube.js';

export const name = 'ready';
export async function listener(client) {
    try {
        await authenticate(['https://www.googleapis.com/auth/youtube'], client);

        sendAdmin(client.users, `${client.shard.ids[0]}번째 샤드에서 ${client.user.tag}이 작동 중입니다.`);
    } catch (err) {
        sendAdmin(client.users, `클라이언트 준비 중 에러 발생\n에러 내용: ${err.stack}`);
    }
}
