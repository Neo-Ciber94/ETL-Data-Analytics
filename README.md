# ETL Data Analytics

[![CI][ci_badge]][ci]

[ci]: https://github.com/Neo-Ciber94/ETL-Data-Analytics/actions/workflows/ci.yml
[ci_badge]: https://github.com/Neo-Ciber94/ETL-Data-Analytics/actions/workflows/ci.yml/badge.svg

An Extract-Transform-Load (ETL) project from 3 sources.

## Diagram

![Flow graph](./assets/process_transactions_graph.png)


## Getting started

1. To start the project use `docker compose up -d` and wait for all the services to initialize
2. After that hit the endpoint `http://localhost:18080/etl/process` to start processing the transactions
    - (Windows) wget <http://localhost:18080/etl/process> -Method POST
    - (Linux) curl -X POST <http://localhost:18080/etl/process>

    This may take some seconds
3. Check the reports in the `mongodb` database, in the `reports` collection: <http://localhost:18082>
    - user: root
    - password: EtLTest2022
