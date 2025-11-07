import { Film, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onUpload?: () => void;
}

export function EmptyState({ onUpload }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Film className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No videos found</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        {onUpload
          ? "Get started by uploading your first video to the library."
          : "Try adjusting your search or filters to find what you're looking for."}
      </p>
      {onUpload && (
        <Button onClick={onUpload} data-testid="button-empty-upload">
          <Upload className="h-4 w-4 mr-2" />
          Upload Video
        </Button>
      )}
    </div>
  );
}
