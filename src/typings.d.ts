declare namespace NodeJS {
  export interface ProcessEnv {
    /**
     * Message queue url.
     */
    RABBITMQ_URL: string;
  }
}
