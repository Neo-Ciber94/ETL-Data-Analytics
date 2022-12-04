import { customers, PrismaClient } from "@prisma/client";
import { ICache } from "../caching/cache.interface";
import { getNullCache } from "../caching/null.cache.js";

export interface CustomerRepositoryOptions {
  readonly client: PrismaClient;
  readonly cache?: ICache<customers>;
}

export class CustomerRepository {
  constructor(private readonly options: CustomerRepositoryOptions) {}

  async getByAccountId(accountId: number): Promise<customers | null> {
    const { client, cache = getNullCache() } = this.options;
    const cacheKey = String(accountId);

    if (await cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const account = await client.accounts.findFirst({
      where: {
        account_id: accountId,
      },
    });

    if (account == null) {
      return null;
    }

    const customer = await client.customers.findFirst({
      where: {
        username: account.username,
      },
    });

    if (customer) {
      await cache.set(cacheKey, customer);
    }

    return customer;
  }

  async getByUserName(userName: string): Promise<customers | null> {
    const { client, cache = getNullCache() } = this.options;
    if (await cache.has(userName)) {
      return cache.get(userName);
    }

    const customer = await client.customers.findFirst({
      where: {
        username: userName,
      },
    });

    if (customer) {
      await cache.set(userName, customer);
    }

    return customer;
  }

  async getByEmail(email: string): Promise<customers | null> {
    const { client, cache = getNullCache() } = this.options;
    if (await cache.has(email)) {
      return cache.get(email);
    }

    const customer = await client.customers.findFirst({
      where: {
        email,
      },
    });

    if (customer) {
      await cache.set(email, customer);
    }

    return customer;
  }

  // FIXME: Searching for the name is not safe
  async dangerouslyGetCustomerByName(name: string): Promise<customers | null> {
    const { client, cache = getNullCache() } = this.options;
    if (await cache.has(name)) {
      return cache.get(name);
    }

    const customer = await client.customers.findFirst({
      where: {
        name,
      },
    });

    if (customer) {
      await cache.set(name, customer);
    }

    return customer;
  }
}
