import glob from "glob";
import { asBollFile, BollFile } from "./boll-file";
import { FileGlob, FileGlobOptions } from "./types";
import { promisify } from "util";
const globAsync = promisify(glob);

export class TypescriptSourceGlob implements FileGlob {
  constructor(private options: FileGlobOptions = {}) {}

  async findFiles(): Promise<BollFile[]> {
    let paths = await globAsync("./{,!(node_modules)/**}/*.ts?(x)");
    paths = paths.filter(path => !path.includes("node_modules"));

    if (this.options.exclude) {
      for (const excludeGlob of this.options.exclude) {
        const exclusions = await globAsync(excludeGlob);
        const filteredPaths = paths.filter(p => !exclusions.includes(p));
        paths = filteredPaths;
      }
    }

    if (this.options.include) {
      for (const includeGlob of this.options.include) {
        const inclusions = await globAsync(includeGlob);
        inclusions.forEach(i => {
          if (!paths.includes(i)) {
            paths.push(i);
          }
        });
      }
    }

    return paths.map(asBollFile);
  }

  get include(): string[] {
    return this.options.include || [];
  }

  get exclude(): string[] {
    return this.options.exclude || [];
  }
}
