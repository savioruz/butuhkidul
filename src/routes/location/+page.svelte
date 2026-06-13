<script lang="ts">
	import { siteConfig } from '$lib/metadata';

	const googleMapsEmbedUrl =
		'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.3039250239203!2d110.27576072573447!3d-7.863228978172313!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7af921ec0e2b1f%3A0x8ea440c9c9a1a377!2sButuh%20Kidul%2C%20Triwidadi%2C%20Pajangan%2C%20Bantul%20Regency%2C%20Special%20Region%20of%20Yoga%20karta!5e0!3m2!1sen!2sid!4v1757404961400!5m2!1sen!2sid';
</script>

<svelte:head>
	<title>Location - {siteConfig.name}</title>
</svelte:head>

<div class="h-[calc(100dvh-3.5rem)] w-full">
	<iframe
		src={googleMapsEmbedUrl}
		class="h-full w-full"
		loading="lazy"
		allowfullscreen
		title="Google Maps"
	></iframe>
</div>
