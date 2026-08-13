export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove anything that's not a letter, number, space, or hyphen
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens into one
}