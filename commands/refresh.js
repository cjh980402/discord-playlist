import { authenticate } from '../util/youtube.js';

export const commandData = {
    name: 'refresh',
    description: '봇 새로고침 명령어입니다.'
};
export async function commandExecute(interaction) {
    if (!interaction.inGuild()) {
        return interaction.followUp('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    }

    if (interaction.user.id === ADMIN_ID) {
        // 관리자 여부 체크
        await authenticate(['https://www.googleapis.com/auth/youtube'], interaction.client);
    }
    await interaction.followUp('새로고침이 완료되었습니다.');
}
