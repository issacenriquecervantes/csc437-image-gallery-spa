import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { ValidRoutes } from "./shared/ValidRoutes";
import { connectMongo } from "./connectMondo";
import { ImageProvider } from "./ImageProvider"

dotenv.config(); // Read the .env file in the current working directory, and load values into process.env.
const mongoClient = connectMongo();

const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";


const app = express();
app.use(express.static(STATIC_DIR));


app.get("/api/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});

app.get("/api/images", async (req: Request, res: Response) => {
    try {
        const images = await new ImageProvider(mongoClient).getAllImagesWithAuthors();
        res.json(images);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch images" });
    }
});

app.get(Object.values(ValidRoutes) as string[], (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "..", "..", "frontend", "dist", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
