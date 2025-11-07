import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { HeroSection } from "@/components/hero-section";
import { SearchBar } from "@/components/search-bar";
import { VideoCard } from "@/components/video-card";
import { VideoPlayerModal } from "@/components/video-player-modal";
import { EmptyState } from "@/components/empty-state";
import { VideoGridSkeleton } from "@/components/loading-skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Upload, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Video } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showHero, setShowHero] = useState(true);

  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
  });

  const filteredVideos = videos?.filter((video) => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All Categories" || video.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = async (video: Video) => {
    try {
      const response = await fetch(`/api/videos/${video.id}/download`);
      if (!response.ok) throw new Error("Download failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = video.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: `Downloading ${video.title}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Could not download the video. Please try again.",
      });
    }
  };

  const handleBrowse = () => {
    setShowHero(false);
    const element = document.getElementById("video-library");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">MovieVault</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setLocation("/upload")}
              data-testid="button-upload"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/admin")}
              data-testid="button-admin"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {showHero && (
        <HeroSection
          onBrowse={handleBrowse}
          onUpload={() => setLocation("/upload")}
        />
      )}

      {/* Video Library */}
      <div id="video-library" className="py-12">
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          {isLoading ? (
            <VideoGridSkeleton />
          ) : filteredVideos && filteredVideos.length > 0 ? (
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
            }>
              {filteredVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onPlay={setSelectedVideo}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          ) : (
            <EmptyState onUpload={() => setLocation("/upload")} />
          )}
        </div>
      </div>

      {/* Video Player Modal */}
      <VideoPlayerModal
        video={selectedVideo}
        open={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        onDownload={handleDownload}
      />
    </div>
  );
}
