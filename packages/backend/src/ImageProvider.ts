import { Collection, MongoClient, ObjectId } from "mongodb";

interface IImageDocument {
    _id: ObjectId;
    src: string;
    name: string;
    authorId: ObjectId; // Make sure this is ObjectId if your DB stores it as such
}

export interface IImageData {
    _id: ObjectId;
    src: string;
    name: string;
    author: { _id: string; username: string; email: string;}; // Make sure this is ObjectId if your DB stores it as such
}

export class ImageProvider {
    private collection: Collection<IImageDocument>;

    constructor(private readonly mongoClient: MongoClient) {
        const collectionName = process.env.IMAGES_COLLECTION_NAME;
        if (!collectionName) {
            throw new Error("Missing IMAGES_COLLECTION_NAME from environment variables");
        }
        this.collection = this.mongoClient.db().collection(collectionName);
    }

    // Fetch all images with author denormalized
    async getAllImagesWithAuthors() {
        return this.collection.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "authorId",
                    foreignField: "_id",
                    as: "author"
                }
            },
            { $unwind: "$author" },
            {
                $project: {
                    _id: 1,
                    src: 1,
                    name: 1,
                    author: {
                        _id: 1,
                        username: 1,
                        email: 1
                    }
                }
            }
        ]).toArray();
    }

    getAllImages() {
        return this.collection.find().toArray();
    }
}