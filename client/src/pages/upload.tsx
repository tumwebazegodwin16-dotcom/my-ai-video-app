import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVideoSchema, type InsertVideo } from "@shared/schema";
import { Upload, ArrowLeft, Film, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { queryClient } from "@/lib/queryClient";
import { z } from "zod";

const uploadFormSchema = insertVideoSchema.extend({
  file: z.any().refine((val) => val instanceof File || val instanceof FileList, {
    message: "Please select a video file",
  }),
});

type UploadFormData = z.infer<typeof uploadFormSchema>;

const categories = [
  "Action",
  "Drama",
  "Comedy",
  "Sci-Fi",
  "Documentary",
  "Horror",
  "Romance",
  "Thriller",
  "Other",
];

export default function UploadPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Other",
      duration: "",
      thumbnailUrl: "",
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("video/")) {
        setSelectedFile(file);
        form.setValue("file", file);
        if (!form.getValues("title")) {
          form.setValue("title", file.name.replace(/\.[^/.]+$/, ""));
        }
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select a video file",
        });
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      form.setValue("file", file);
      if (!form.getValues("title")) {
        form.setValue("title", file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const onSubmit = async (data: UploadFormData) => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a video file to upload",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", data.title);
      formData.append("description", data.description || "");
      formData.append("category", data.category || "Other");
      formData.append("duration", data.duration ?? "");
      formData.append("thumbnailUrl", data.thumbnailUrl ?? "");

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          toast({
            title: "Upload successful",
            description: "Your video has been uploaded successfully",
          });
          queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
          setLocation("/");
        } else {
          throw new Error("Upload failed");
        }
      });

      xhr.addEventListener("error", () => {
        throw new Error("Upload failed");
      });

      xhr.open("POST", "/api/videos");
      xhr.send(formData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Could not upload the video. Please try again.",
      });
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-2xl font-bold">Upload Video</h2>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Upload Form */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* File Upload Area */}
            <Card className="p-8">
              <FormField
                control={form.control}
                name="file"
                render={() => (
                  <FormItem>
                    <FormLabel>Video File</FormLabel>
                    <FormControl>
                      <div
                        className={`relative border-2 border-dashed rounded-md p-12 text-center transition-colors ${
                          dragActive
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        data-testid="dropzone-upload"
                      >
                        {selectedFile ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-center gap-3">
                              <Film className="h-12 w-12 text-primary" />
                              <div className="text-left">
                                <p className="font-medium" data-testid="text-filename">
                                  {selectedFile.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedFile(null);
                                  form.setValue("file", undefined as any);
                                }}
                                data-testid="button-remove-file"
                              >
                                <X className="h-5 w-5" />
                              </Button>
                            </div>
                            {uploading && (
                              <div className="space-y-2">
                                <Progress value={uploadProgress} />
                                <p className="text-sm text-muted-foreground">
                                  Uploading... {uploadProgress}%
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-lg font-medium mb-2">
                              Drag and drop your video here
                            </p>
                            <p className="text-sm text-muted-foreground mb-4">
                              or click to browse files
                            </p>
                            <Input
                              type="file"
                              accept="video/*"
                              onChange={handleFileInput}
                              className="hidden"
                              id="file-input"
                              data-testid="input-file"
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => document.getElementById("file-input")?.click()}
                              data-testid="button-browse"
                            >
                              Browse Files
                            </Button>
                          </>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            {/* Video Details */}
            <Card className="p-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter video title"
                          {...field}
                          data-testid="input-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter video description"
                          rows={4}
                          {...field}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-upload-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 2h 15m"
                            {...field}
                            value={field.value ?? ""}
                            data-testid="input-duration"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="thumbnailUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail URL (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter thumbnail image URL"
                          {...field}
                          value={field.value ?? ""}
                          data-testid="input-thumbnail"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/")}
                disabled={uploading}
                data-testid="button-cancel"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploading || !selectedFile}
                data-testid="button-submit"
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Uploading..." : "Upload Video"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
