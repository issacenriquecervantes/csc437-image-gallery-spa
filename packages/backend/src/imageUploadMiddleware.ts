import { Request, Response, NextFunction } from "express";
import multer from "multer";

declare module "express-serve-static-core" {
    interface Request {
        user?: { username: string };
        imageDocument?: { src: string; name: string; author: string };
    }
}

class ImageFormatError extends Error { }

const storageEngine = multer.diskStorage({
    destination: function (req, file, cb) {
        // Use IMAGE_UPLOAD_DIR from environment, default to "uploads"
        const uploadDir = process.env.IMAGE_UPLOAD_DIR || "uploads";
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Determine file extension based on mimetype
        let fileExtension = "";
        if (file.mimetype === "image/png") {
            fileExtension = "png";
        } else if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
            fileExtension = "jpg";
        } else {
            // Unsupported file type
            cb(new ImageFormatError("Unsupported image type"), "");
            return;
        }

        // Generate a random file name to avoid collisions
        const fileName = Date.now() + "-" + Math.round(Math.random() * 1E9) + "." + fileExtension;
        cb(null, fileName);
    }
});

export const imageMiddlewareFactory = multer({
    storage: storageEngine,
    limits: {
        files: 1,
        fileSize: 5 * 1024 * 1024 // 5 MB
    },
});

export function handleImageFileErrors(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            res.status(413).send({
                error: "File Too Large",
                message: "The uploaded file exceeds the 5MB size limit."
            });
            return;
        }
        res.status(400).send({
            error: "Bad Request",
            message: err.message
        });
        return;
    }
    if (err instanceof ImageFormatError) {
        res.status(400).send({
            error: "Bad Request",
            message: err.message
        });
        return;
    }
    next(err);
}

export function checkImageFields(req: Request, res: Response, next: NextFunction) {
    if (!req.file || !req.body.name) {
        res.status(400).send({
            error: "Bad Request",
            message: "Missing required image file or name field in form data."
        });
        return;
    }
    const filename = req.file.filename;
    const src = `/uploads/${filename}`;
    const name = req.body.name;
    const author = req.user?.username || "unknown";
    req.imageDocument = { src, name, author };
    next();
}