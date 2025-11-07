import { type Video, type InsertVideo, type UpdateVideo } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Video operations
  getAllVideos(searchQuery?: string, category?: string): Promise<Video[]>;
  getVideoById(id: string): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: string, updates: UpdateVideo): Promise<Video | undefined>;
  deleteVideo(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private videos: Map<string, Video>;

  constructor() {
    this.videos = new Map();
  }

  async getAllVideos(searchQuery?: string, category?: string): Promise<Video[]> {
    let videos = Array.from(this.videos.values());
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      videos = videos.filter(
        (v) =>
          v.title.toLowerCase().includes(query) ||
          v.description.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (category && category !== "All Categories") {
      videos = videos.filter((v) => v.category === category);
    }
    
    return videos.sort(
      (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    );
  }

  async getVideoById(id: string): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = randomUUID();
    const video: Video = {
      ...insertVideo,
      id,
      uploadDate: new Date(),
      category: insertVideo.category || "Other",
      description: insertVideo.description || "",
      duration: insertVideo.duration || null,
      thumbnailUrl: insertVideo.thumbnailUrl || null,
    };
    this.videos.set(id, video);
    return video;
  }

  async updateVideo(id: string, updates: UpdateVideo): Promise<Video | undefined> {
    const video = this.videos.get(id);
    if (!video) {
      return undefined;
    }
    
    const updatedVideo: Video = {
      ...video,
      ...updates,
    };
    
    this.videos.set(id, updatedVideo);
    return updatedVideo;
  }

  async deleteVideo(id: string): Promise<boolean> {
    return this.videos.delete(id);
  }
}

export const storage = new MemStorage();
