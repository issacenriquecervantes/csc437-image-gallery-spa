import express, { Request, Response } from "express";
import { ImageProvider } from "../ImageProvider";
import { ObjectId } from "mongodb";
import { verifyAuthToken } from "../verifyAuthToken";
import { checkImageFields, handleImageFileErrors, imageMiddlewareFactory } from "../imageUploadMiddleware";

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

    app.post(
        "/api/images",
        verifyAuthToken,
        imageMiddlewareFactory.single("image"),
        checkImageFields, // regular middleware
        async (req, res) => {
            if (!req.imageDocument) {
                res.status(400).json({ error: "Bad Request", message: "Missing image document." });
                return;
            }
            await imageProvider.createImage(req.imageDocument);
            res.status(201).send();
        }
    );

    app.patch("/api/images/edit/:id", verifyAuthToken, async (req: Request, res: Response) => {
        const imageId = req.params.id;
        const validId = ObjectId.isValid(imageId)
        const MAX_NAME_LENGTH = 100

        const newName = req.body.newName as string | undefined;

        if (!validId) {
            res.status(404).send({
                error: "Not Found",
                message: "Image does not exist. Invalid ObjectId."
            });
            return;
        }

        if (!newName) {
            res.status(400).send({
                error: "Bad Request",
                message: "Missing required newName query."
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
            // Get the logged-in username from the request (set by verifyAuthToken)
            const username = req.user?.username;
            if (username === undefined) {
                res.status(401).send({ error: "Unauthorized", message: "No user logged in." });
                return;
            }

            // Check if the logged-in user is the author of the image

            const isAuthor = await imageProvider.isUserAuthorOfImage(imageId, username);

            if (!isAuthor) {
                res.status(403).send({
                    error: "Forbidden",
                    message: "You are not the author of this image."
                });
                return;
            }

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

    // Register error handler globally, after all routes:
    app.use(handleImageFileErrors);
}

