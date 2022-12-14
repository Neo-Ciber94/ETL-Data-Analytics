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

  async getByNameBirthDateAndAddress(criteria: {
    name: string;
    birthdate: Date;
    address: string;
  }): Promise<customers | null> {
    const { client, cache = getNullCache() } = this.options;
    const { name, birthdate, address } = criteria;
    const mmddyyyy = dateToMMddYYYY(birthdate);
    const key = JSON.stringify({ name, mmddyyyy, address });

    if (await cache.has(key)) {
      return cache.get(key);
    }

    const customer = await client.customers.findFirst({
      where: {
        name,
        birthdate,
        address,
      },
    });

    if (customer) {
      await cache.set(key, customer);
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

function dateToMMddYYYY(date: Date): string {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  const month = date.getMonth();
  const day = date.getDate();
  const year = date.getFullYear();
  return [month, day, year].join("-");
}
