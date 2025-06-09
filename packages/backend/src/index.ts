import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { ValidRoutes } from "./shared/ValidRoutes";
import { connectMongo } from "./connectMondo";
import { ImageProvider } from "./ImageProvider"
import { registerImageRoutes } from "./routes/imageRoutes";
import { registerAuthRoutes } from "./routes/authRoutes";
import { CredentialsProvider } from "./CredentialsProvider";
import { verifyAuthToken } from "./verifyAuthToken";

dotenv.config(); // Read the .env file in the current working directory, and load values into process.env.
const mongoClient = connectMongo();

const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";
const JWT_SECRET = process.env.JWT_SECRET;
const IMAGE_UPLOAD_DIR = process.env.IMAGE_UPLAOD_DIR || "uploads";

const app = express();

app.use(express.static(STATIC_DIR));
app.use("/uploads", express.static(IMAGE_UPLOAD_DIR))
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.locals.JWT_SECRET = JWT_SECRET;

app.post('/profile', (req, res, next) => {
    console.log(req.body)
    res.json(req.body)
})

app.get("/api/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});

app.use("/api/*", verifyAuthToken);

registerImageRoutes(app, new ImageProvider(mongoClient))
registerAuthRoutes(app, new CredentialsProvider(mongoClient))

app.get(Object.values(ValidRoutes) as string[], (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "..", "..", "frontend", "dist", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
