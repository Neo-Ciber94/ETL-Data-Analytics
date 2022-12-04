declare namespace NodeJS {
  export interface ProcessEnv {
    /**
     * Environment.
     */
    ENV?: ENV;

    /**
     * A `true` or `false` value indicating whether if the process is running in a container.
     */
    CONTAINERIZED?: string;

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
