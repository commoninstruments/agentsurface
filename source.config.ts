import { defineDocs, frontmatterSchema } from "fumadocs-mdx/config";
import { z } from "zod";

export const docs = defineDocs({
  dir: "src/content/docs",
  docs: {
    // Extend the default fumadocs frontmatter (title/description/…) with an
    // optional freshness stamp. YAML parses an unquoted `2026-07-06` into a
    // `Date`, so normalize that back to a `YYYY-MM-DD` string before validating.
    schema: frontmatterSchema.extend({
      lastVerified: z
        .preprocess(
          (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
          z.iso.date(),
        )
        .optional(),
    }),
  },
});
