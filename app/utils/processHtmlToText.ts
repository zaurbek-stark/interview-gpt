// Function to extract text and limit to 2000 words
export const processHtmlToText = (html: string, limit: number = 2000): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  let textContent = doc.body.textContent || ''; // Get the text content from the parsed HTML
  
  // Remove unwanted characters and patterns
  textContent = textContent.split('(opens in a new window)')[0]; // Remove everything after (opens in a new window)
  textContent = textContent.replace(/\\u003c\/?p/g, ''); // Remove \u003c/p
  textContent = textContent.replace(/\\?\"static\/chunks\/[^\s]+/g, ''); // Remove \"static/chunks/...
  textContent = textContent.replace(/\\?\$undefined\\?/g, ''); // Remove \"$undefined\"
  
  // Trim and split by whitespace to get words
  const words = textContent.trim().split(/\s+/);
  
  // Limit to the first 2000 words
  if (words.length > limit) {
    return words.slice(0, limit).join(' ');
  }
  return words.join(' ');
};
