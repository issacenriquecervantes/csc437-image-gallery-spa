import { Collection, MongoClient } from "mongodb";
import bcrypt from "bcrypt";

interface ICredentialsDocument {
    username: string;
    password: string;
}

export class CredentialsProvider {
    private readonly collection: Collection<ICredentialsDocument>;

    constructor(mongoClient: MongoClient) {
        const COLLECTION_NAME = process.env.CREDS_COLLECTION_NAME;
        if (!COLLECTION_NAME) {
            throw new Error("Missing CREDS_COLLECTION_NAME from env file");
        }
        this.collection = mongoClient.db().collection<ICredentialsDocument>(COLLECTION_NAME);
    }

    async registerUser(username: string, plaintextPassword: string) {

        if (await this.collection.findOne({ username }) !== null) {
            return false;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plaintextPassword, salt)

        console.log(`salt: ${salt}`)
        console.log(`hashpswd: ${hashedPassword}`)

        await this.collection.insertOne({ username: username, password: hashedPassword })
        return true;
    }

    async verifyPassword(username: string, plaintextPassword: string) {
    // Find the user by username
    const user = await this.collection.findOne({ username });

    if (user === null) {
        return false;
    }

    const match = await bcrypt.compare(plaintextPassword, user.password);

    return match;
}
}
