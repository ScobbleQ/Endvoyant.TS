/** Fetch pages on demand. Queries must sort by a unique key and exclude the previous cursor. */
export async function* paginate<T>(
  fetchPage: (after: string | undefined, limit: number) => Promise<T[]>,
  getCursor: (row: T) => string,
  pageSize = 25,
) {
  let after: string | undefined;
  while (true) {
    const rows = await fetchPage(after, pageSize);
    if (rows.length === 0) return;
    yield rows;
    after = getCursor(rows[rows.length - 1]!);
    if (rows.length < pageSize) return;
  }
}
