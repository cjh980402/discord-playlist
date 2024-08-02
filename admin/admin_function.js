import { exec as _exec } from 'node:child_process';
import { promisify } from 'node:util';
import { sendChannelID } from './bot_message.js';
import { getFullContent, sendSplitCode } from '../util/bot_util.js';

export const exec = promisify(_exec);

export async function adminChat(message) {
    const fullContent = await getFullContent(message);
    const targetId = /^\^(\d+)\^\s/.exec(fullContent)?.[1];
    if (fullContent.startsWith(']')) {
        // 노드 코드 실행 후 출력
        const funcBody = fullContent.slice(1).trim().split('\n'); // 긴 코드 테스트를 위해 fullContent 이용
        funcBody.push(`return ${funcBody.pop()};`); // 함수의 마지막 줄 내용은 자동으로 반환
        await sendSplitCode(message.channel, String(await eval(`(async () => {\n${funcBody.join('\n')}\n})()`)), {
            code: 'js',
            split: { char: '' }
        });
        // eval의 내부가 async 함수의 리턴값이므로 await까지 해준다.
    } else if (fullContent.startsWith(')')) {
        // 콘솔 명령 실행 후 출력
        await sendSplitCode(message.channel, (await exec(fullContent.slice(1).trim())).stdout, {
            code: 'ansi',
            split: { char: '' }
        });
    } else if (targetId) {
        // 원하는 방에 봇으로 채팅 전송 (텍스트 채널 ID 이용)
        const rslt = await sendChannelID(message.client.channels, targetId, fullContent.slice(targetId.length + 3));
        await message.channel.send(rslt ? '채팅이 전송되었습니다.' : '존재하지 않는 방입니다.');
    }
}
