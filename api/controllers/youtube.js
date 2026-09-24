const CHANNEL_HANDLE = process.env.YOUTUBE_CHANNEL_HANDLE || 'awakeningclasses';

let channelCache = null;

function decodeText(value) {
    return String(value || '')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

function toVideo(videoId, snippet, publishedAt) {
    const title = decodeText(snippet?.title);
    if (!videoId || !title || title === 'Private video' || title === 'Deleted video') {
        return null;
    }

    const thumbs = snippet?.thumbnails || {};
    const thumb = thumbs.high || thumbs.medium || thumbs.standard || thumbs.default;

    return {
        id: videoId,
        title,
        thumbnail: thumb?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        publishedAt: publishedAt || snippet?.publishedAt || null,
        url: `https://www.youtube.com/watch?v=${videoId}`,
    };
}

async function youtubeGet(pathname, params) {
    const url = new URL(`https://www.googleapis.com/youtube/v3/${pathname}`);
    Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.set(key, value);
    });

    const response = await fetch(url);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(data?.error?.message || 'YouTube request failed');
        error.status = response.status;
        throw error;
    }
    return data;
}

async function getChannel(apiKey) {
    if (channelCache) return channelCache;

    const data = await youtubeGet('channels', {
        part: 'snippet,contentDetails',
        forHandle: CHANNEL_HANDLE,
        key: apiKey,
    });

    const item = data.items?.[0];
    const uploadsPlaylistId = item?.contentDetails?.relatedPlaylists?.uploads;
    const channelId = item?.id;
    const thumbs = item?.snippet?.thumbnails || {};
    const channelAvatar = thumbs.high?.url || thumbs.medium?.url || thumbs.default?.url || '';
    if (!uploadsPlaylistId || !channelId) {
        throw new Error('YouTube channel uploads were not found');
    }

    channelCache = { uploadsPlaylistId, channelId, channelAvatar };
    return channelCache;
}

exports.listLatestVideos = async (req, res) => {
    try {
        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                success: false,
                message: 'YouTube API key is not configured',
            });
        }

        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 6, 1), 20);
        const pageToken = typeof req.query.pageToken === 'string' ? req.query.pageToken : '';
        const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
        const channel = await getChannel(apiKey);

        const data = query
            ? await youtubeGet('search', {
                part: 'snippet',
                channelId: channel.channelId,
                q: query,
                type: 'video',
                order: 'relevance',
                maxResults: String(limit),
                pageToken,
                key: apiKey,
            })
            : await youtubeGet('playlistItems', {
                part: 'snippet,contentDetails',
                playlistId: channel.uploadsPlaylistId,
                maxResults: String(limit),
                pageToken,
                key: apiKey,
            });

        const videos = (data.items || [])
            .map((item) => {
                const videoId = item.id?.videoId || item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
                return toVideo(
                    videoId,
                    item.snippet,
                    item.contentDetails?.videoPublishedAt
                );
            })
            .filter(Boolean);

        return res.status(200).json({
            success: true,
            channelId: channel.channelId,
            channelAvatar: channel.channelAvatar || '',
            videos,
            nextPageToken: data.nextPageToken || null,
        });
    } catch (error) {
        console.error('YouTube videos error:', error.message);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Could not load YouTube videos',
        });
    }
};

exports.getVideoDetails = async (req, res) => {
    try {
        const apiKey = process.env.YOUTUBE_API_KEY;
        const videoId = String(req.params.id || '');
        if (!apiKey) {
            return res.status(500).json({
                success: false,
                message: 'YouTube API key is not configured',
            });
        }
        if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
            return res.status(400).json({ success: false, message: 'Invalid video' });
        }

        const videoData = await youtubeGet('videos', {
            part: 'statistics,snippet',
            id: videoId,
            key: apiKey,
        });

        let commentData = { items: [] };
        try {
            commentData = await youtubeGet('commentThreads', {
                part: 'snippet',
                videoId,
                maxResults: '8',
                order: 'relevance',
                textFormat: 'plainText',
                key: apiKey,
            });
        } catch (commentError) {
            commentData = { items: [] };
        }

        const stats = videoData.items?.[0]?.statistics || {};
        const comments = (commentData.items || [])
            .map((thread) => {
                const snippet = thread.snippet?.topLevelComment?.snippet;
                if (!snippet?.textDisplay) return null;
                return {
                    id: thread.id,
                    author: decodeText(snippet.authorDisplayName) || 'Viewer',
                    text: decodeText(snippet.textDisplay),
                    likes: Number(snippet.likeCount) || 0,
                    publishedAt: snippet.publishedAt || null,
                    avatar: snippet.authorProfileImageUrl || '',
                };
            })
            .filter(Boolean);

        return res.status(200).json({
            success: true,
            stats: {
                views: Number(stats.viewCount) || 0,
                likes: Number(stats.likeCount) || 0,
                comments: Number(stats.commentCount) || 0,
            },
            comments,
        });
    } catch (error) {
        console.error('YouTube video details error:', error.message);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Could not load video details',
        });
    }
};
