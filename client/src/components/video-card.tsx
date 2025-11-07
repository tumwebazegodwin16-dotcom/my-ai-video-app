import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Download } from "lucide-react";
import type { Video } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface VideoCardProps {
  video: Video;
  onPlay: (video: Video) => void;
  onDownload: (video: Video) => void;
}

export function VideoCard({ video, onPlay, onDownload }: VideoCardProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  return (
    <Card 
      className="group overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all duration-200"
      data-testid={`card-video-${video.id}`}
    >
      <div className="relative aspect-video bg-muted overflow-hidden">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            data-testid={`img-thumbnail-${video.id}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <Play className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Hover overlay with actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          <Button
            size="icon"
            variant="default"
            onClick={(e) => {
              e.stopPropagation();
              onPlay(video);
            }}
            data-testid={`button-play-${video.id}`}
          >
            <Play className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(video);
            }}
            data-testid={`button-download-${video.id}`}
          >
            <Download className="h-5 w-5" />
          </Button>
        </div>

        {/* Duration badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2">
            <Badge variant="secondary" className="text-xs backdrop-blur-sm bg-black/70 text-white border-0">
              {video.duration}
            </Badge>
          </div>
        )}
      </div>

      <div className="p-4" onClick={() => onPlay(video)}>
        <h3 className="font-semibold text-lg line-clamp-1 mb-1" data-testid={`text-title-${video.id}`}>
          {video.title}
        </h3>
        {video.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {video.description}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span data-testid={`text-date-${video.id}`}>{formatDate(video.uploadDate)}</span>
          <div className="flex items-center gap-2">
            {video.category && (
              <Badge variant="outline" className="text-xs">
                {video.category}
              </Badge>
            )}
            <span data-testid={`text-size-${video.id}`}>{formatFileSize(video.fileSize)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
