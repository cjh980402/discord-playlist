import { readdirSync } from 'node:fs';
import { SoyaClient } from './classes/SoyaClient.js';
const client = new SoyaClient('./db/list_data.db');

process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));
// node.js v15부터 Unhandled promise rejection이 발생하면 프로세스를 비정상 종료시키므로 처리를 해야함
process.on('unhandledRejection', (err) => console.error('Unhandled promise rejection:', err));

try {
    // 이벤트 리스너 추가
    for (const file of readdirSync('./events')) {
        const event = await import(`./events/${file}`);
        client.on(event.name, event.listener);
    }
    // 봇 커맨드 추가
    for (const file of readdirSync('./commands')) {
        const cmd = await import(`./commands/${file}`);
        client.commands.set(cmd.commandData.name, cmd);
    }

    await client.start(); // 클라이언트 작동 시작
} catch (err) {
    console.error('로그인 에러 발생:', err);
}
