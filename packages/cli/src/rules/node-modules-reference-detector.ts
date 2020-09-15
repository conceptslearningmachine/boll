import { asBollLineNumber, BollFile, Failure, FileContext, PackageRule, Result, Success } from "@boll/core";
import { SourceFile } from "typescript";

const MULTI_LINE_COMMENT_REGEXP = /\/\*(.|\n|\r)*\*\//g;
const SINGLE_LINE_COMMENT_REGEXP = /\/\/.*(\n|\r)*/g;

const ruleName = "NodeModulesReferenceDetector";

/**
 * NodeModulesReferenceDetector will detect references to
 * the node_modules directory in code and imports.
 *
 * Imports should only be done from packages explicitly
 * declared in package.json.
 */
export class NodeModulesReferenceDetector implements PackageRule {
  get name(): string {
    return ruleName;
  }

  check(fileContext: FileContext): Result[] {
    return this.checkParsedSourceLines(fileContext.filename, this.getParsedSourceLines(fileContext.source));
  }

  checkParsedSourceLines(fileName: BollFile, parsedSourceLines: string[]): Result[] {
    const results: Result[] = [];
    parsedSourceLines.forEach(
      l =>
        l.includes("node_modules") &&
        results.push(
          new Failure(ruleName, fileName, asBollLineNumber(0), `Explicit reference to "node_modules" directory: ${l}`)
        )
    );
    if (results.length > 0) {
      return results;
    }
    return [new Success(ruleName)];
  }

  getParsedSourceLines(sourceFile: SourceFile): string[] {
    const parsedSourceLines: string[] = [];
    sourceFile.forEachChild(c => {
      const trimmedNodeText = c.getFullText().trim();
      const multiLineCommentsRemovedText = trimmedNodeText
        .split(MULTI_LINE_COMMENT_REGEXP)
        .map(n => n.trim())
        .filter(n => n)
        .join("");
      const singleLineCommentsRemovedText = multiLineCommentsRemovedText
        .split(SINGLE_LINE_COMMENT_REGEXP)
        .map(n => n && n.trim())
        .filter(n => n)
        .join("");
      parsedSourceLines.push(singleLineCommentsRemovedText);
    });
    return parsedSourceLines;
  }
}
