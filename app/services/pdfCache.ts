import { Directory, File, Paths } from 'expo-file-system';

function materialDir(id: string) {
  return new Directory(Paths.document, 'pdf-cache', id);
}

function revisionDir(id: string, revision: string) {
  return new Directory(materialDir(id), revision);
}

function pageFile(id: string, revision: string, page: number) {
  return new File(revisionDir(id, revision), `${page}.jpg`);
}

export function readCachedPageUris(id: string, revision: string): string[] {
  try {
    const dir = revisionDir(id, revision);
    if (!dir.exists) return [];
    return dir
      .list()
      .filter((item) => item instanceof File && /^\d+\.jpg$/.test(item.name))
      .sort((a, b) => Number.parseInt(a.name, 10) - Number.parseInt(b.name, 10))
      .map((item) => item.uri);
  } catch {
    return [];
  }
}

export function cachedPageUri(id: string, revision: string, page: number): string | null {
  try {
    const file = pageFile(id, revision, page);
    return file.exists ? file.uri : null;
  } catch {
    return null;
  }
}

export function saveCachedPage(id: string, revision: string, page: number, bytes: Uint8Array): string | null {
  try {
    const root = materialDir(id);
    if (!root.exists) root.create({ intermediates: true, idempotent: true });
    for (const item of root.list()) {
      if (item instanceof Directory && item.name !== revision) {
        try {
          item.delete();
        } catch {
          // stale revision
        }
      }
    }

    const dir = revisionDir(id, revision);
    if (!dir.exists) dir.create({ intermediates: true, idempotent: true });

    const file = pageFile(id, revision, page);
    if (file.exists) file.delete();
    file.create();
    file.write(bytes);
    return file.uri;
  } catch {
    return null;
  }
}
