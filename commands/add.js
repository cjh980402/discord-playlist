import { AddPlaylist } from '../util/youtube.js';

export const commandData = {
    name: 'add',
    description: '해당 서버에 올라오는 유튜브 링크를 자동으로 재생목록에 추가하도록 합니다.'
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
        const listId = await AddPlaylist(interaction.guild.name, `${interaction.guild.name}의 재생목록`);
        interaction.client.db.insert('guild_playlist', {
            guild_id: interaction.guildId,
            channel_id: interaction.channelId,
            list_id: listId
        });
        await interaction.followUp(
            `https://www.youtube.com/playlist?list=${listId} 재생목록에 링크가 자동 저장됩니다.`
        );
    }
}
