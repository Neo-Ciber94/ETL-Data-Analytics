import mongoose from "mongoose";

export class MongoClient {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  /**
   * Connects to the mongo database.
   */
  static async connect(): Promise<mongoose.Connection> {
    await mongoose.connect(process.env.MONGODB_URL);
    return mongoose.connection;
  }
}
