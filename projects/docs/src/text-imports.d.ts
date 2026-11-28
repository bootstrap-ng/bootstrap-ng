// Example sources are imported as text with `with { loader: 'text' }`, so the docs
// show the exact code that runs.
declare module '*.html' {
  const content: string;
  export default content;
}

// CHANGELOG.md is imported as text for the Changelog page.
declare module '*.md' {
  const content: string;
  export default content;
}
