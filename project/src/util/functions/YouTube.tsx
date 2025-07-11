import { YouTubePlayerVideo } from "@/contexts/videoContext";
import { makeRequest } from "../axios";

type FetchNextVideosParams = {
  query: string;
  pageToken?: string | null;
};

export const fetchNextVideos = async ({
  query,
  pageToken,
}: FetchNextVideosParams): Promise<{
  videos: YouTubePlayerVideo[];
  nextPageToken: string | null;
}> => {
  try {
    const res = await makeRequest.post("/api/youtube/fetch-next", {
      query,
      pageToken,
    });
    return {
      videos: res.data.videos,
      nextPageToken: res.data.nextPageToken,
    };
  } catch (err) {
    console.error("Failed to fetch videos", err);
    throw err;
  }
};
