import { adminChat } from '../admin/admin_function.js';
import { sendAdmin } from '../admin/bot_message.js';
import { ADMIN_ID } from '../config.js';
import { AddPlaylistVideo, oauth2Client } from '../util/youtube.js';

const ytVideoRegex = /^[\w-]{11}$/;
const ytValidPathDomains = /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/(embed|v|shorts|live)\/)/;
const ytValidQueryDomains = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'];

function getVideoId(urlOrId, checkUrl = false) {
    try {
        if (ytVideoRegex.test(urlOrId) && !checkUrl) {
            return urlOrId;
        }
        const url = new URL(urlOrId);
        let id = url.searchParams.get('v');
        if (ytValidPathDomains.test(urlOrId) && !id) {
            const paths = url.pathname.split('/');
            id = paths[url.hostname === 'youtu.be' ? 1 : 2].slice(0, 11);
        } else if (!ytValidQueryDomains.includes(url.hostname)) {
            return null;
        }
        return ytVideoRegex.test(id ?? '') ? id : null;
    } catch {
        return null;
    }
}

export const name = 'messageCreate';
export async function listener(message) {
    try {
        if (!message.content || message.author.bot || message.author.system) {
            // 빈 메시지, 봇, 시스템 유저 여부 체크
            return;
        }

        if (message.author.id === ADMIN_ID) {
            // 관리자 여부 체크
            await adminChat(message);
        }

        const listData = message.client.db.get('SELECT * FROM guild_playlist WHERE guild_id = ?', message.guildId);
        if (listData) {
            const listId = listData.list_id;
            const videoId = getVideoId(message.content, true);
            console.log(message.content);
            if (videoId) {
                if (oauth2Client.credentials.expiry_date < Date.now()) {
                    await oauth2Client.refreshAccessToken();
                }
                await AddPlaylistVideo(listId, videoId);
            }
        }
    } catch (err) {
        try {
            sendAdmin(
                message.client.users,
                `작성자: ${message.author.username}\n방 ID: ${message.channelId}\n채팅 내용: ${message}\n에러 내용: ${err.stack}`
            );
            await message.reply('에러로그가 전송되었습니다.');
        } catch {}
    }
}
