import fs from "fs";

import readline from "readline/promises";
import { Stream } from "./streams";

/**
 * The options of the parser.
 */
export interface CsvToJsonOptions {
  /**
   * The path of the file to parse.
   */
  filePath: string;

  /**
   * The csv separator.
   * @default to `,`.
   */
  separator?: string;

  /**
   * Callback for streams errors.
   */
  onError?: (error: unknown) => void;
}

/**
 * Parse a csv file and streams the result objects.
 * @param options The options to parse the csv.
 */
export async function* csvToJsonStream(
  options: CsvToJsonOptions
): Stream<unknown> {
  const { filePath, onError, separator = "," } = options;
  const fileStream = fs.createReadStream(filePath);
  const lines = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  fileStream.on("error", (err) => {
    if (onError) {
      onError(err);
    }
  });

  let headers: string[] = [];
  let lineNumber = 0;

  for await (const line of lines) {
    const curLineNumber = lineNumber++;

    // Skip empty lines
    if (line.trim().length === 0) {
      continue;
    }

    const row = line.split(separator).map((e) => e.trim());

    if (curLineNumber === 0) {
      headers = row;
      continue;
    }

    const obj = {} as any;
    for (let i = 0; i < headers.length; i++) {
      const key = headers[i]!; // SAFETY: index in range
      obj[key] = row[i];
    }

    yield obj;
  }
}
