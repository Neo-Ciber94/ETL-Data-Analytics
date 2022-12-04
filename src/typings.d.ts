declare namespace NodeJS {
  export interface ProcessEnv {
    /**
     * Environment.
     */
    ENV?: ENV;

    /**
     * Message queue url.
     */
    RABBITMQ_URL: string;

    /**
     * Mongoose url.
     */
    MONGODB_URL: string;

    /**
     * Server port.
     */
    PORT: string;
  }
}
