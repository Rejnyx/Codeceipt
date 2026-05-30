/** A single file touched by a unified diff. */
export interface DiffFile {
  path: string;
  added: string[];
  removed: string[];
  isNew: boolean;
  isDelete: boolean;
  isBinary: boolean;
}

const GIT_HEADER = /^diff --git a\/(.+?) b\/(.+)$/;

/**
 * Parse a unified git diff into per-file added/removed line contents.
 * Tolerant of `diff --git`, `+++ b/<path>`, `--- a/<path>`, and hunk headers.
 */
export function parseDiff(diff: string): DiffFile[] {
  const files: DiffFile[] = [];
  let current: DiffFile | null = null;

  const blank = (): DiffFile => ({
    path: "",
    added: [],
    removed: [],
    isNew: false,
    isDelete: false,
    isBinary: false,
  });
  const push = () => {
    if (current) files.push(current);
  };

  for (const line of diff.split(/\r?\n/)) {
    const header = GIT_HEADER.exec(line);
    if (header) {
      push();
      current = blank();
      // Seed the path from the `b/` side so rename-only diffs keep a path.
      current.path = header[2].trim();
      continue;
    }
    if (!current) current = blank();

    if (line.startsWith("new file")) current.isNew = true;
    else if (line.startsWith("deleted file")) current.isDelete = true;
    else if (line.startsWith("rename to ")) current.path = line.slice(10).trim();
    else if (line.startsWith("Binary files ") || line.startsWith("GIT binary patch"))
      current.isBinary = true;
    else if (line.startsWith("+++ ")) {
      const p = line.slice(4).trim();
      if (p !== "/dev/null") current.path = p.replace(/^b\//, "");
    } else if (line.startsWith("--- ")) {
      const p = line.slice(4).trim();
      if (!current.path && p !== "/dev/null") current.path = p.replace(/^a\//, "");
    } else if (!current.isBinary && line[0] === "+") {
      // Headers ("+++ "/"--- ") are matched above, so branch on the single
      // leading char — preserves content lines like "++i" / "--count;".
      current.added.push(line.slice(1));
    } else if (!current.isBinary && line[0] === "-") {
      current.removed.push(line.slice(1));
    }
  }
  push();

  return files.filter((f) => f.path || f.added.length || f.removed.length);
}

export function addedLineCount(files: DiffFile[]): number {
  return files.reduce((n, f) => n + f.added.length, 0);
}
