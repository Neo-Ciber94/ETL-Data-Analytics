# ETL Data Analytics

[![CI][ci_badge]][ci]

[ci]: https://github.com/Neo-Ciber94/ETL-Data-Analytics/actions/workflows/ci.yml
[ci_badge]: https://github.com/Neo-Ciber94/ETL-Data-Analytics/actions/workflows/ci.yml/badge.svg

An Extract-Transform-Load (ETL) pipeline for stocks from 3 sources.

## Diagram

![Flow graph](./assets/process_transactions_graph.png)

## Getting started

1. To start the project use `docker compose up -d` and wait for all the services to initialize
2. After that hit the endpoint `http://localhost:18080/etl/process` to start processing the transactions

   - **(Windows)**

     ```bash
     Invoke-WebRequest http://localhost:18080/etl/process -Method POST -UseBasicParsing
     ```

   - **(Linux)**

     ```bash
     curl -X POST http://localhost:18080/etl/process
     ```

   This may take some seconds

3. Check the reports in the `mongodb` database, in the `reports` collection: <http://localhost:18082>
   - user: root
   - password: EtLTest2022
4. Check the rabbit message queue, in the `transactions.error` and `transactions.insight` queues: <http://localhost:18083>
   - user: root
   - password: EtLTest2022
5. To remove the containers run `docker compose down`
