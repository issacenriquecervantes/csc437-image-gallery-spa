import express, { Request, Response } from "express";
import { ImageProvider } from "../ImageProvider";
import { ObjectId } from "mongodb";

export function registerImageRoutes(app: express.Application, imageProvider: ImageProvider) {

    app.get("/api/images", async (req: Request, res: Response) => {
        try {
            const substring = req.query.substring as string | undefined;
            const images = substring !== undefined ? await imageProvider.getAllImages(substring) : await imageProvider.getAllImages();
            res.json(images);
        } catch (err) {
            res.status(500).json({ error: "Failed to fetch images from /api/images." });
        }
    });

    app.put("/api/images/edit/:id", async (req: Request, res: Response): Promise<void> => {
        const imageId = req.params.id;
        const newName = req.query.newName as string | undefined;
        const validId = ObjectId.isValid(imageId)
        const MAX_NAME_LENGTH = 100

        if (!newName) {
            res.status(400).send({
                error: "Bad Request",
                message: "Missing required newName query."
            });
            return;
        }

        if (!validId) {
            res.status(404).send({
                error: "Not Found",
                message: "Image does not exist. Invalid ObjectId."
            });
            return;
        }

        if (newName.length > MAX_NAME_LENGTH) {
            res.status(422).send({
                error: "Unprocessable Entity",
                message: `Image name exceeds ${MAX_NAME_LENGTH} characters.`
            });
            return;
        }

        try {
            const data = await imageProvider.updateImageName(imageId, newName);
            if (data === 0) {
                res.status(404).send({ error: "NotFound", message: "Image does not exist." });
            } else {
                res.status(204).send();
            }
        } catch (err) {
            res.status(500).send({ error: "Internal Server Error", message: "Failed to update image name" });
        }
    });

}