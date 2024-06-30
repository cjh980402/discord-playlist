import { BaseChannel, ChatInputCommandInteraction, cleanCodeBlockContent } from 'discord.js';
import { request } from 'undici';

function splitMessage(text, { maxLength = 2000, char = '\n', prepend = '', append = '' } = {}) {
    if (text.length <= maxLength) {
        return [text];
    }

    const splitText = text.split(char);
    if (splitText.some((elem) => elem.length > maxLength)) {
        throw new RangeError('SPLIT_MAX_LEN');
    }

    let msg = '';
    const messages = [];
    for (const chunk of splitText) {
        if (msg && (msg + char + chunk + append).length > maxLength) {
            messages.push(msg + append);
            msg = prepend;
        }
        msg += (msg && msg !== prepend ? char : '') + chunk;
    }

    return messages.concat(msg).filter(Boolean);
}

function contentSplitCode(content, options) {
    content ||= '\u200b'; // 빈 문자열 방지
    const splitOptions = options.split ? { ...options.split } : null; // 옵션을 수정할 수도 있기 때문에 복사본 생성

    if (options.code) {
        content = `\`\`\`${options.code}\n${cleanCodeBlockContent(content)}\n\`\`\``;
        if (splitOptions) {
            splitOptions.prepend = `${splitOptions.prepend ?? ''}\`\`\`${options.code}\n`;
            splitOptions.append = `\n\`\`\`${splitOptions.append ?? ''}`;
        }
    }

    return splitOptions ? splitMessage(content, splitOptions) : [content];
}

export async function getFullContent(message) {
    if (message.attachments.first()?.name === 'message.txt') {
        const { body } = await request(message.attachments.first().url);
        return body.text();
    } else {
        return message.content;
    }
}

export async function sendSplitCode(target, content, options) {
    for (const c of contentSplitCode(content, options)) {
        if (target instanceof BaseChannel && target.isTextBased()) {
            await target.send(c);
        } else if (target instanceof ChatInputCommandInteraction) {
            await target.followUp(c);
        }
    }
}
