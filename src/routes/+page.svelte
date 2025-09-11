<script lang="ts">
	import Home from '$lib/components/pages/home/home.svelte';
	import Footer from '@/components/pages/footer/footer.svelte';
	import Separator from '@/components/ui/separator/separator.svelte';
	import type { VillagesResponse } from '@/types/village';
	import type { ArticlesResponse } from '@/types/article';

	interface PageData {
		locale: string;
		pathname: string;
		villageData?: VillagesResponse | null;
		articlesData?: ArticlesResponse | null;
		villageError?: string | null;
		articlesError?: string | null;
	}

	export let data: PageData;
</script>

<Home
	villageData={data.villageData ?? null}
	articlesData={data.articlesData ?? null}
	villageError={data.villageError ?? null}
	articlesError={data.articlesError ?? null}
/>
<Separator class="my-8" />
<Footer />
