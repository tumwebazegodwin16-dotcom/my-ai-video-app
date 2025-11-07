import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertVideoSchema, updateVideoSchema } from "@shared/schema";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for video uploads
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files statically
  app.use("/uploads", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  }, express.static(uploadsDir));

  // Get all videos with optional search and category filters
  app.get("/api/videos", async (req, res) => {
    try {
      const searchQuery = req.query.search as string | undefined;
      const category = req.query.category as string | undefined;
      const videos = await storage.getAllVideos(searchQuery, category);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ error: "Failed to fetch videos" });
    }
  });

  // Get video by ID
  app.get("/api/videos/:id", async (req, res) => {
    try {
      const video = await storage.getVideoById(req.params.id);
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      console.error("Error fetching video:", error);
      res.status(500).json({ error: "Failed to fetch video" });
    }
  });

  // Upload video
  app.post("/api/videos", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const videoData = {
        title: req.body.title,
        description: req.body.description || "",
        filename: req.file.filename, // Disk filename
        originalFilename: req.file.originalname, // Original filename for downloads
        fileSize: req.file.size,
        duration: req.body.duration || "",
        category: req.body.category || "Other",
        thumbnailUrl: req.body.thumbnailUrl || "",
      };

      // Validate video data
      const validatedData = insertVideoSchema.parse(videoData);

      // Store video
      const video = await storage.createVideo(validatedData);

      res.status(200).json(video);
    } catch (error) {
      console.error("Error uploading video:", error);
      
      // Clean up uploaded file if database save fails
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }
      
      res.status(500).json({ error: "Failed to upload video" });
    }
  });

  // Stream video
  app.get("/api/videos/:id/stream", async (req, res) => {
    try {
      const video = await storage.getVideoById(req.params.id);
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }

      const videoPath = path.join(uploadsDir, video.filename);
      
      if (!fs.existsSync(videoPath)) {
        return res.status(404).json({ error: "Video file not found" });
      }

      const stat = fs.statSync(videoPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": "video/mp4",
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          "Content-Length": fileSize,
          "Content-Type": "video/mp4",
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
      }
    } catch (error) {
      console.error("Error streaming video:", error);
      res.status(500).json({ error: "Failed to stream video" });
    }
  });

  // Download video
  app.get("/api/videos/:id/download", async (req, res) => {
    try {
      const video = await storage.getVideoById(req.params.id);
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }

      const videoPath = path.join(uploadsDir, video.filename);
      
      if (!fs.existsSync(videoPath)) {
        return res.status(404).json({ error: "Video file not found" });
      }

      // Use original filename for download
      res.download(videoPath, video.originalFilename);
    } catch (error) {
      console.error("Error downloading video:", error);
      res.status(500).json({ error: "Failed to download video" });
    }
  });

  // Update video metadata
  app.patch("/api/videos/:id", async (req, res) => {
    try {
      // Validate update data
      const validatedData = updateVideoSchema.parse(req.body);

      const video = await storage.updateVideo(req.params.id, validatedData);
      
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }

      res.json(video);
    } catch (error) {
      console.error("Error updating video:", error);
      res.status(500).json({ error: "Failed to update video" });
    }
  });

  // Delete video
  app.delete("/api/videos/:id", async (req, res) => {
    try {
      const video = await storage.getVideoById(req.params.id);
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }

      const videoPath = path.join(uploadsDir, video.filename);
      
      // Delete from storage
      const deleted = await storage.deleteVideo(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Video not found" });
      }

      // Delete file from disk
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ error: "Failed to delete video" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
