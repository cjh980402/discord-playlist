export const commandData = {
    name: 'show',
    description: '해당 서버의 유튜브 재생목록 링크를 보여줍니다.'
};
export async function commandExecute(interaction) {
    if (!interaction.inGuild()) {
        return interaction.followUp('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    }

    const listData = interaction.client.db.get('SELECT * FROM guild_playlist WHERE guild_id = ?', interaction.guildId);
    if (listData) {
        await interaction.followUp(
            `<#${listData.channel_id}>에 올라오는 링크가 https://www.youtube.com/playlist?list=${listData.list_id} 재생목록에 자동 저장되어있습니다.`
        );
    } else {
        await interaction.followUp('자동 재생목록에 추가되어있지 않은 서버입니다.');
    }
}
