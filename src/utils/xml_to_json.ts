import xml2js from "xml2js";

/**
 * Parse the given xml string.
 * @param data The xml data to parse.
 * @param options The options to pass to the parser.
 * @returns Returns the parsed object.
 */
export async function xmlToJson(
  data: string,
  options?: xml2js.ParserOptions
): Promise<unknown> {
  const parser = new xml2js.Parser(options);
  const result = await parser.parseStringPromise(data);
  return result;
}
