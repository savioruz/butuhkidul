export const siteConfig = {
	name: 'Butuh Kidul',
	logo: '/favicon.svg',
	description:
		'Portal resmi Padukuhan Butuh Kidul, Triwidadi, Pajangan, Bantul, DI Yogyakarta — Informasi desa, data kependudukan, artikel, dan layanan publik.',
	keywords:
		'Butuh Kidul, Padukuhan Butuh Kidul, Triwidadi, Pajangan, Bantul, DIY, Yogyakarta, informasi desa, data penduduk',
	url: new URL('https://butuhkidul.my.id'), // Update with actual village URL
	ogImage: new URL('https://butuhkidul.my.id/og.png'), // Update with actual OG image
	links: {
		twitter: new URL('https://twitter.com/butuhkidul'), // Update with village social media
		github: new URL('https://github.com/savioruz/butuhkidul') // Keep the GitHub repo
	},
	googleVerification: 'ZT3D3dKoFM37nsuKJcdsfMz3KVogiIxKxaY-8m7tp-Y',
	yandexVerification: '@TODO - Replace with your Yandex verification code'
} as const;

export type SiteConfig = typeof siteConfig;
