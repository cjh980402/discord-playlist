import { google } from 'googleapis';
import { PORT, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../config.js';
import { sendAdmin } from '../admin/bot_message.js';
import http from 'http';
import destroyer from 'server-destroy';

const youtube = google.youtube('v3');

/**
 * Create a new OAuth2 client with the configured keys.
 */
const redirect_uri = `http://localhost:${PORT}`;
export const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirect_uri);

/**
 * This is one of the many ways you can configure googleapis to use authentication credentials. In this method, we're setting a global reference for all APIs.
 */
google.options({ auth: oauth2Client });

/**
 * Open an http server to accept the oauth callback.
 */
export async function authenticate(scopes, client) {
    return new Promise((resolve, reject) => {
        // grab the url that will be used for authorization
        const authorizeUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: scopes.join(' ')
        });
        sendAdmin(client.users, authorizeUrl);
        const server = http
            .createServer(async (req, res) => {
                try {
                    const qs = new URL(req.url, redirect_uri).searchParams;
                    res.end('Authentication successful! Please return to the console.');
                    server.destroy();
                    const { tokens } = await oauth2Client.getToken(qs.get('code'));
                    oauth2Client.setCredentials(tokens);
                    resolve(oauth2Client);
                } catch (err) {
                    reject(err);
                }
            })
            .listen(PORT, () => console.log(`${PORT}번 port에 http server를 띄웠습니다.`));
        destroyer(server);
    });
}

export async function AddPlaylist(title, desc) {
    const res = await youtube.playlists.insert({
        part: 'id, snippet, status',
        requestBody: {
            snippet: {
                title: title,
                description: desc
            },
            status: {
                privacyStatus: 'unlisted'
            }
        }
    });
    return res.data.id;
}

export async function AddPlaylistVideo(listId, videoId) {
    const res = await youtube.playlistItems.insert({
        part: 'snippet, contentDetails, status',
        requestBody: {
            snippet: {
                playlistId: listId,
                resourceId: {
                    kind: 'youtube#video',
                    videoId: videoId
                }
            }
        }
    });
}
