import { Button } from "@/components/ui/button";
import { Play, Upload } from "lucide-react";
import heroImage from "@assets/generated_images/Hero_banner_background_image_8f0f1a65.png";

interface HeroSectionProps {
  onBrowse: () => void;
  onUpload: () => void;
}

export function HeroSection({ onBrowse, onUpload }: HeroSectionProps) {
  return (
    <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Hero background"
          className="w-full h-full object-cover"
        />
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
          MovieVault
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
          Your personal cinema library. Stream and download high-quality movies instantly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={onBrowse}
            className="text-lg h-12 px-8"
            data-testid="button-hero-browse"
          >
            <Play className="h-5 w-5 mr-2" />
            Browse Library
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onUpload}
            className="text-lg h-12 px-8 backdrop-blur-md bg-white/10 hover:bg-white/20 text-white border-white/30"
            data-testid="button-hero-upload"
          >
            <Upload className="h-5 w-5 mr-2" />
            Upload Video
          </Button>
        </div>
      </div>
    </div>
  );
}
