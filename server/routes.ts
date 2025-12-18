import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { randomBytes } from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Files routes
  app.get("/api/files", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const files = await storage.getFiles(userId);
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.get("/api/files/deleted", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const files = await storage.getDeletedFiles(userId);
      res.json(files);
    } catch (error) {
      console.error("Error fetching deleted files:", error);
      res.status(500).json({ message: "Failed to fetch deleted files" });
    }
  });

  app.get("/api/files/:id", isAuthenticated, async (req: any, res) => {
    try {
      const file = await storage.getFile(req.params.id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      if (file.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      res.json(file);
    } catch (error) {
      console.error("Error fetching file:", error);
      res.status(500).json({ message: "Failed to fetch file" });
    }
  });

  app.get("/api/files/:id/content", isAuthenticated, async (req: any, res) => {
    try {
      const file = await storage.getFile(req.params.id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      if (file.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      if (file.filePath) {
        const resolvedPath = path.resolve(file.filePath);
        const uploadsPath = path.resolve(uploadDir);
        
        if (!resolvedPath.startsWith(uploadsPath)) {
          return res.status(403).json({ message: "Invalid file path" });
        }
        
        if (fs.existsSync(resolvedPath)) {
          res.setHeader("Content-Type", file.mimeType);
          return res.sendFile(resolvedPath);
        }
      }
      
      if (file.content) {
        res.setHeader("Content-Type", file.mimeType);
        return res.send(file.content);
      }
      
      res.status(404).json({ message: "File content not found" });
    } catch (error) {
      console.error("Error fetching file content:", error);
      res.status(500).json({ message: "Failed to fetch file content" });
    }
  });

  app.post(
    "/api/files/upload",
    isAuthenticated,
    upload.array("files", 10),
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const uploadedFiles = req.files as Express.Multer.File[];
        const createdFiles = [];

        for (const file of uploadedFiles) {
          const ext = path.extname(file.originalname).slice(1) || "bin";
          const name = path.basename(file.originalname, path.extname(file.originalname));

          const isTextFile = [
            "txt",
            "md",
            "json",
            "js",
            "ts",
            "html",
            "css",
          ].includes(ext.toLowerCase());

          let content = null;
          if (isTextFile) {
            content = fs.readFileSync(file.path, "utf-8");
          }

          const createdFile = await storage.createFile({
            userId,
            name,
            extension: ext,
            mimeType: file.mimetype,
            size: file.size,
            content,
            filePath: file.path,
            positionX: Math.floor(Math.random() * 400) + 16,
            positionY: Math.floor(Math.random() * 300) + 16,
            isDeleted: false,
          });

          createdFiles.push(createdFile);
        }

        res.json(createdFiles);
      } catch (error) {
        console.error("Error uploading files:", error);
        res.status(500).json({ message: "Failed to upload files" });
      }
    }
  );

  app.patch("/api/files/:id", isAuthenticated, async (req: any, res) => {
    try {
      const file = await storage.getFile(req.params.id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      if (file.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { name, content, positionX, positionY } = req.body;
      const updatedFile = await storage.updateFile(req.params.id, {
        ...(name !== undefined && { name }),
        ...(content !== undefined && { content }),
        ...(positionX !== undefined && { positionX }),
        ...(positionY !== undefined && { positionY }),
      });

      res.json(updatedFile);
    } catch (error) {
      console.error("Error updating file:", error);
      res.status(500).json({ message: "Failed to update file" });
    }
  });

  app.delete("/api/files/:id", isAuthenticated, async (req: any, res) => {
    try {
      const file = await storage.getFile(req.params.id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      if (file.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteFile(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  app.post("/api/files/:id/restore", isAuthenticated, async (req: any, res) => {
    try {
      const file = await storage.getFile(req.params.id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      if (file.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.restoreFile(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error restoring file:", error);
      res.status(500).json({ message: "Failed to restore file" });
    }
  });

  app.delete(
    "/api/files/:id/permanent",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const file = await storage.getFile(req.params.id);
        if (!file) {
          return res.status(404).json({ message: "File not found" });
        }
        if (file.userId !== req.user.claims.sub) {
          return res.status(403).json({ message: "Forbidden" });
        }

        if (file.filePath && fs.existsSync(file.filePath)) {
          fs.unlinkSync(file.filePath);
        }

        await storage.permanentDeleteFile(req.params.id);
        res.json({ success: true });
      } catch (error) {
        console.error("Error permanently deleting file:", error);
        res.status(500).json({ message: "Failed to delete file permanently" });
      }
    }
  );

  app.delete("/api/files/trash/empty", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deletedFiles = await storage.getDeletedFiles(userId);

      for (const file of deletedFiles) {
        if (file.filePath && fs.existsSync(file.filePath)) {
          fs.unlinkSync(file.filePath);
        }
      }

      await storage.emptyTrash(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error emptying trash:", error);
      res.status(500).json({ message: "Failed to empty trash" });
    }
  });

  app.post("/api/files/:id/share", isAuthenticated, async (req: any, res) => {
    try {
      const file = await storage.getFile(req.params.id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      if (file.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const shareToken = randomBytes(16).toString("hex");
      const updatedFile = await storage.updateFile(req.params.id, {
        shareToken,
      });

      res.json(updatedFile);
    } catch (error) {
      console.error("Error sharing file:", error);
      res.status(500).json({ message: "Failed to share file" });
    }
  });

  // Share routes (public)
  app.post("/api/share/:token/add", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const originalFile = await storage.getFileByShareToken(req.params.token);

      if (!originalFile) {
        return res.status(404).json({ message: "Shared file not found" });
      }

      const newFile = await storage.createFile({
        userId,
        name: originalFile.name,
        extension: originalFile.extension,
        mimeType: originalFile.mimeType,
        size: originalFile.size,
        content: originalFile.content,
        filePath: originalFile.filePath,
        positionX: Math.floor(Math.random() * 400) + 16,
        positionY: Math.floor(Math.random() * 300) + 16,
        isDeleted: false,
      });

      res.json(newFile);
    } catch (error) {
      console.error("Error adding shared file:", error);
      res.status(500).json({ message: "Failed to add shared file" });
    }
  });

  // Settings routes
  app.get("/api/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = await storage.getSettings(userId);
      res.json(settings || { theme: "classic" });
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { theme, desktopBackground, customColors } = req.body;

      const settings = await storage.upsertSettings({
        userId,
        theme,
        desktopBackground,
        customColors,
      });

      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
