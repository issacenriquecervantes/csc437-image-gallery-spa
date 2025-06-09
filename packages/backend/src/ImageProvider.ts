import { Collection, MongoClient, ObjectId } from "mongodb";

interface IImageDocument {
    _id: ObjectId;
    src: string;
    name: string;
    authorId: string; // always a string username
}

export class ImageProvider {
    private collection: Collection<IImageDocument>;
    private db: ReturnType<MongoClient['db']>;

    constructor(mongoClient: MongoClient) {
        const collectionName = process.env.IMAGES_COLLECTION_NAME;
        if (!collectionName) {
            throw new Error("Missing IMAGES_COLLECTION_NAME from environment variables");
        }
        this.db = mongoClient.db();
        this.collection = this.db.collection(collectionName);
    }

    async getAllImages(nameSubstring?: string) {
        const query: any = {};
        if (nameSubstring) {
            query.name = { $regex: nameSubstring, $options: "i" };
        }
        const images = await this.collection.find(query).toArray();

        // Attach a fake user document using the string authorId
        return images.map(img => ({
            ...img,
            author: {
                _id: img.authorId,
                username: img.authorId,
                email: `${img.authorId}@example.com`
            }
        }));
    }

    async updateImageName(imageId: string, newName: string): Promise<number> {
        const _id = new ObjectId(imageId);
        const result = await this.collection.updateOne(
            { _id },
            { $set: { name: newName } }
        );
        return result.matchedCount;
    }

    async isUserAuthorOfImage(imageId: string, username: string): Promise<boolean> {
        if (!imageId) return false;
        const image = await this.collection.findOne({ _id: new ObjectId(imageId) });
        if (!image) return false;
        // authorId is always a string username
        return image.authorId === username;
    }

    async createImage(image: { src: string; name: string; author: string }): Promise<void> {
    const usersCollection = this.db.collection<{ _id: string; username: string; email: string }>("users");
    let user = await usersCollection.findOne({ _id: image.author });
    if (!user) {
        // Insert a new user with a fake email if not found
        const fakeUser = {
            _id: image.author, // string username as _id
            username: image.author,
            email: `${image.author}@example.com`
        };
        await usersCollection.insertOne(fakeUser);
        user = fakeUser;
    }
    // Insert the new image document with authorId as string username
    await this.collection.insertOne({
        src: image.src,
        name: image.name,
        authorId: user._id, // string username
        _id: new ObjectId()
    });
}
}
