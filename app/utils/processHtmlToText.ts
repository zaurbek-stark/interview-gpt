// Function to extract text and limit to 2000 words
export const processHtmlToText = (html: string, limit: number = 2000): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const textContent = doc.body.textContent || ''; // Get the text content from the parsed HTML
  console.log('processing textContent:', textContent);
  const words = textContent.trim().split(/\s+/); // Split by whitespace to get words
  
  // Limit to the first 2000 words
  if (words.length > limit) {
    return words.slice(0, limit).join(' ');
  }
  return words.join(' ');
};
