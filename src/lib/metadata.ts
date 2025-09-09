export const siteConfig = {
	name: 'Butuh Kidul',
	logo: '/favicon.svg',
	description:
		'Website resmi Padukuhan Butuh Kidul - Padukuhan yang indah dengan tradisi kaya dan masyarakat yang harmonis',
	keywords: 'Desa Butuh Kidul, village, Indonesia, komunitas, tradisi, budaya, wisata desa',
	url: new URL('https://butuhkidul.my.id'), // Update with actual village URL
	ogImage: new URL('https://butuhkidul.my.id/og.png'), // Update with actual OG image
	links: {
		twitter: new URL('https://twitter.com/butuhkidul'), // Update with village social media
		github: new URL('https://github.com/savioruz/butuhkidul') // Keep the GitHub repo
	},
	googleVerification: '@TODO - Replace with your Google verification code',
	yandexVerification: '@TODO - Replace with your Yandex verification code'
} as const;

export type SiteConfig = typeof siteConfig;
