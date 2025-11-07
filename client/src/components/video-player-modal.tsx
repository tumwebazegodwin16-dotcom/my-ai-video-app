import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, X } from "lucide-react";
import type { Video } from "@shared/schema";

interface VideoPlayerModalProps {
  video: Video | null;
  open: boolean;
  onClose: () => void;
  onDownload: (video: Video) => void;
}

export function VideoPlayerModal({ video, open, onClose, onDownload }: VideoPlayerModalProps) {
  if (!video) return null;

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
      month: "long", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0" data-testid="modal-video-player">
        <div className="relative">
          {/* Video Player */}
          <div className="aspect-video bg-black">
            <video
              controls
              className="w-full h-full"
              src={`/api/videos/${video.id}/stream`}
              data-testid="video-player"
              autoPlay
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
            onClick={onClose}
            data-testid="button-close-modal"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Video Details */}
        <div className="p-6">
          <DialogHeader className="mb-4">
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="text-2xl font-bold" data-testid="text-modal-title">
                {video.title}
              </DialogTitle>
              <Button
                onClick={() => onDownload(video)}
                data-testid="button-modal-download"
                className="flex-shrink-0"
              >
                <Download className="h-4 w-4 mr-2" />
                Download ({formatFileSize(video.fileSize)})
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {video.description && (
              <p className="text-muted-foreground" data-testid="text-modal-description">
                {video.description}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {video.category && (
                <Badge variant="secondary" data-testid="badge-modal-category">
                  {video.category}
                </Badge>
              )}
              {video.duration && (
                <Badge variant="outline" data-testid="badge-modal-duration">
                  Duration: {video.duration}
                </Badge>
              )}
              <Badge variant="outline" data-testid="badge-modal-date">
                Uploaded {formatDate(video.uploadDate)}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
