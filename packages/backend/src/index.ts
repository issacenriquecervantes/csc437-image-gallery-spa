import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { ValidRoutes } from "./shared/ValidRoutes";
import { connectMongo } from "./connectMondo";
import { ImageProvider } from "./ImageProvider"
import { registerImageRoutes } from "./routes/imageRoutes";

dotenv.config(); // Read the .env file in the current working directory, and load values into process.env.
const mongoClient = connectMongo();

const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";


const app = express();
app.use(express.static(STATIC_DIR));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.post('/profile', (req, res, next) => {
    console.log(req.body)
    res.json(req.body)
})

app.get("/api/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});

registerImageRoutes(app, new ImageProvider(mongoClient))

app.get(Object.values(ValidRoutes) as string[], (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "..", "..", "frontend", "dist", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
