import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const PEXELS_API_KEY = (process.env.PEXELS_API_KEY || "").trim();

export interface PexelsVideoSuggestion {
  id: number;
  url: string;
  image: string;
  duration: number;
  width: number;
  height: number;
  user: {
    name: string;
    url: string;
  };
  videoUrl: string;
}

export class PexelsService {
  async searchVideos(query: string, perPage = 6): Promise<PexelsVideoSuggestion[]> {
    if (!PEXELS_API_KEY || !query.trim()) return [];

    try {
      const response = await axios.get("https://api.pexels.com/v1/videos/search", {
        params: {
          query,
          per_page: perPage,
          orientation: "portrait"
        },
        headers: {
          Authorization: PEXELS_API_KEY
        }
      });

      const videos = response.data?.videos || [];

      const mapped = videos.map((video: any) => {
        const bestFile =
          video.video_files?.find((file: any) => file.width >= 720 && file.height >= 1280 && file.file_type === "video/mp4") ||
          video.video_files?.find((file: any) => file.file_type === "video/mp4") ||
          null;

        return {
          id: video.id,
          url: video.url,
          image: video.image,
          duration: video.duration,
          width: video.width,
          height: video.height,
          user: {
            name: video.user?.name || "Pexels",
            url: video.user?.url || "https://www.pexels.com"
          },
          videoUrl: bestFile?.link || ""
        };
      }).filter((video: PexelsVideoSuggestion) => !!video.videoUrl);

      const shortVertical = mapped
        .filter((video: PexelsVideoSuggestion) => video.duration >= 4 && video.duration <= 15)
        .sort((a: PexelsVideoSuggestion, b: PexelsVideoSuggestion) => a.duration - b.duration);

      return (shortVertical.length > 0 ? shortVertical : mapped.sort((a: PexelsVideoSuggestion, b: PexelsVideoSuggestion) => a.duration - b.duration)).slice(0, perPage);

    } catch (error: any) {
      console.error("PexelsService Error:", error.response?.data || error.message);
      return [];
    }
  }
}
