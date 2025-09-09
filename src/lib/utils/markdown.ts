import { marked } from 'marked';

// Configure marked for better security and functionality
marked.setOptions({
	breaks: true,
	gfm: true
});

/**
 * Parse markdown content to HTML
 * @param markdown - The markdown string to parse
 * @returns HTML string
 */
export function parseMarkdown(markdown: string): string {
	if (!markdown) return '';

	try {
		const result = marked.parse(markdown);
		return typeof result === 'string' ? result : '';
	} catch (error) {
		console.error('Error parsing markdown:', error);
		return markdown;
	}
}

/**
 * Strip HTML tags from content for plain text display
 * @param html - HTML string
 * @returns Plain text string
 */
export function stripHtml(html: string): string {
	if (!html) return '';
	return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Get excerpt from content
 * @param content - The content (can be HTML or markdown)
 * @param length - Maximum length of excerpt
 * @returns Excerpt string
 */
export function getExcerpt(content: string, length: number = 150): string {
	if (!content) return '';

	const htmlContent = parseMarkdown(content);
	const plainText = stripHtml(htmlContent);

	if (plainText.length <= length) return plainText;

	return plainText.substring(0, length).trim() + '...';
}
