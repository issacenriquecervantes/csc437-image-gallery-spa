import { Collection, MongoClient, ObjectId } from "mongodb";

interface IImageDocument {
    _id: ObjectId;
    src: string;
    name: string;
    authorId: ObjectId;
}

export interface IImageData {
    _id: ObjectId;
    src: string;
    name: string;
    author: { _id: string; username: string; email: string };
}

export class ImageProvider {
    private collection: Collection<IImageDocument>

    constructor(mongoClient: MongoClient) {
        const collectionName = process.env.IMAGES_COLLECTION_NAME;
        if (!collectionName) {
            throw new Error("Missing IMAGES_COLLECTION_NAME from environment variables");
        }
        this.collection = mongoClient.db().collection(collectionName);
    }

    async getAllImages(nameSubstring?: string) {
    // Build an aggregation pipeline to fetch images, optionally filtering by name substring,
    // and denormalize the author field by joining with the users collection.
    const pipeline: object[] = [];

    // If a name substring is provided, filter images whose name contains the substring (case-insensitive)
    if (nameSubstring) {
        pipeline.push({
            $match: { name: { $regex: nameSubstring, $options: "i" } }
        });
    }

    // Join with the users collection to fetch author details, unwind the author array,
    // and project only the required fields for the image and author.
    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "authorId",
                foreignField: "_id",
                as: "author",
            },
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
                    email: 1,
                },
            },
        }
    );

    // Execute the aggregation pipeline and return the resulting array of images with denormalized author data
    return this.collection.aggregate(pipeline).toArray();
}

    async updateImageName(imageId: string, newName: string): Promise<number> {
        const _id = new ObjectId(imageId);
        const result = await this.collection.updateOne(
            { _id },
            { $set: { name: newName } }
        );
        return result.matchedCount;
    }
}
