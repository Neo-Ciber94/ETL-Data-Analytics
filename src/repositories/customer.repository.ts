import { customers, PrismaClient } from "@prisma/client";

export class CustomerRepository {
  constructor(private readonly client: PrismaClient) {}

  async getByAccountId(accountId: number): Promise<customers | null> {
    const account = await this.client.accounts.findFirst({
      where: {
        account_id: accountId,
      },
    });

    if (account == null) {
      return null;
    }

    const customer = await this.client.customers.findFirst({
      where: {
        username: account.username,
      },
    });

    return customer;
  }

  async getByUserName(userName: string): Promise<customers | null> {
    const customer = await this.client.customers.findFirst({
      where: {
        username: userName,
      },
    });

    return customer;
  }

  async getByEmail(email: string): Promise<customers | null> {
    const customer = await this.client.customers.findFirst({
      where: {
        email,
      },
    });

    return customer;
  }

  // FIXME: Searching for the name is not safe
  async dangerouslyGetCustomerByName(name: string): Promise<customers | null> {
    const customer = await this.client.customers.findFirst({
      where: {
        name,
      },
    });

    return customer;
  }
}
