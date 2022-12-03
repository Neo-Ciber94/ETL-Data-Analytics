import fs from "fs";
import readline from "readline/promises";

console.log("Hello World!");

const fileStream = fs.createReadStream(
  "./tests/data/example_transactions_1.csv"
);
const lines = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity,
});

fileStream.on("error", (err) => {
  console.error(err);
});

let headers: string[] = [];
let lineNumber = 0;

for await (const line of lines) {
  const curLineNumber = lineNumber++;

  //console.log(line);
  // Skip empty lines
  if (line.trim().length === 0) {
    continue;
  }

  const row = line.split(",").map((e) => e.trim());

  if (curLineNumber === 0) {
    headers = row;
    continue;
  }

  const obj = {} as any;
  for (let i = 0; i < headers.length; i++) {
    const key = headers[i]!; // SAFETY: index in range
    obj[key] = row[i];
  }

  console.log(obj);
}
