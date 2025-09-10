export interface NavItem {
	href: string;
	label: string;
	translationKey: string;
}

export const navigationConfig: NavItem[] = [
	{
		href: '/histories',
		label: 'Histories',
		translationKey: 'histories'
	},
	{
		href: '/articles',
		label: 'Articles',
		translationKey: 'articles'
	},
	{
		href: '/organizations',
		label: 'Organizations',
		translationKey: 'organizations'
	},
	{
		href: 'https://kas.butuhkidul.my.id/',
		label: 'Financial',
		translationKey: 'financial'
	}
];
