// backend/tools/youtube.js
export default {
  async search({ q, max = 3, experience = "beginner" }) {
    const key = process.env.YOUTUBE_API_KEY;
    if (!key) {
      console.warn("YOUTUBE_API_KEY not set");
      return [];
    }

    const expTerms = {
      beginner: "easy simple basic",
      intermediate: "intermediate detailed",
      expert: "advanced professional",
    };

    const safeQuery = `${q} ${expTerms[experience] || ""} repair guide tutorial`.trim();
    const url =
      "https://www.googleapis.com/youtube/v3/search" +
      `?part=snippet&type=video&maxResults=${max}` +
      `&q=${encodeURIComponent(safeQuery)}` +
      `&key=${encodeURIComponent(key)}` +
      "&relevanceLanguage=en&videoEmbeddable=true&safeSearch=moderate";

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        console.warn("YouTube API error:", data?.error?.message || res.statusText);
        return [];
      }

      return (data.items || []).map((v) => ({
        title: v.snippet.title,
        url: `https://www.youtube.com/watch?v=${v.id.videoId}`,
        thumbnailUrl: v.snippet.thumbnails?.medium?.url || null,
        description: v.snippet.description || null,
        publishedAt: v.snippet.publishedAt || null,
      }));
    } catch (err) {
      console.warn("YouTube search failed:", err.message);
      return [];
    }
  },
};
