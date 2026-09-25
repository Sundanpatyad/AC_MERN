const CHANNEL_HANDLE = process.env.YOUTUBE_CHANNEL_HANDLE || 'awakeningclasses';
const VIDEO_CACHE_TTL_MS = Math.max(60_000, Number(process.env.YOUTUBE_CACHE_TTL_MS) || 30 * 60 * 1000);
const FALLBACK_CHANNEL_ID = 'UCbCecAHnHvT1TZW6cwmCQug';
const FALLBACK_CHANNEL_AVATAR =
  'https://yt3.ggpht.com/QXlMeCq6qyRC9VoXLPKt8E28jCgtHrmgJ3CwMBzW0b6FNHQay0d6_wp0FCrrvJ2fvYVT5l9WMRk=s800-c-k-c0x00ffffff-no-rj';

// Used when YouTube API quota/network fails. Override with YOUTUBE_FALLBACK_IDS=id1,id2,id3
const DEFAULT_FALLBACK_VIDEOS = [
  {
    id: 'Kyu0WStcnAs',
    title: 'Articles | General English | Marathon | JKSSB',
  },
  {
    id: '9XuMWYgg5as',
    title: 'Input & Output devices | Marathon Session | Latest PYQs | JKSSB',
  },
  {
    id: 'SBYBCQYsPog',
    title: 'JKSSB Finance Account Assistant | Revision Plan',
  },
];

function fallbackVideos(limit = 3) {
  const fromEnv = String(process.env.YOUTUBE_FALLBACK_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter((id) => /^[a-zA-Z0-9_-]{11}$/.test(id));

  const source = fromEnv.length
    ? fromEnv.map((id) => ({ id, title: 'Awakening Classes lecture' }))
    : DEFAULT_FALLBACK_VIDEOS;

  return source.slice(0, limit).map((item) => ({
    id: item.id,
    title: item.title,
    thumbnail: `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
    publishedAt: null,
    url: `https://www.youtube.com/watch?v=${item.id}`,
  }));
}

function fallbackPayload(limit = 3) {
  return {
    success: true,
    channelId: FALLBACK_CHANNEL_ID,
    channelAvatar: FALLBACK_CHANNEL_AVATAR,
    videos: fallbackVideos(limit),
    nextPageToken: null,
    fallback: true,
  };
}

let channelCache = null;
const videoListCache = new Map();

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
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 6, 1), 20);
        if (!apiKey) {
            return res.status(200).json(fallbackPayload(limit));
        }

        const pageToken = typeof req.query.pageToken === 'string' ? req.query.pageToken : '';
        const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
        const cacheKey = `${query || 'latest'}|${limit}|${pageToken}`;
        const cached = videoListCache.get(cacheKey);
        if (cached && Date.now() - cached.at < VIDEO_CACHE_TTL_MS) {
            return res.status(200).json({ ...cached.payload, cached: true });
        }

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

        const payload = {
            success: true,
            channelId: channel.channelId,
            channelAvatar: channel.channelAvatar || '',
            videos,
            nextPageToken: data.nextPageToken || null,
        };
        videoListCache.set(cacheKey, { at: Date.now(), payload });

        return res.status(200).json(payload);
    } catch (error) {
        console.error('YouTube videos error:', error.message);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 6, 1), 20);
        const pageToken = typeof req.query.pageToken === 'string' ? req.query.pageToken : '';
        const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
        const cacheKey = `${query || 'latest'}|${limit}|${pageToken}`;
        const stale = videoListCache.get(cacheKey);
        if (stale?.payload) {
            return res.status(200).json({ ...stale.payload, cached: true, stale: true });
        }
        return res.status(200).json(fallbackPayload(limit));
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
