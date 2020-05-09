<script context="module">
	const elements = new Set();

	export function stopAll() {
		elements.forEach(element => {
			element.pause();
		});
	}

	export function playMarker() {
		elements.forEach(element => {
			element.play();
		})
	}

/* 	export function setCardInfo() {
		title = 
	} */
</script>


<script>
	import { onMount } from 'svelte';
	import Cardinfo from '../components/cardinfo.svelte';

	export let src;
	export let id;


	let audio;
	let paused = true;

	onMount(() => {
		elements.add(audio);
		return () => elements.delete(audio);
	});

	function stopOthers() {
		elements.forEach(element => {
			if (element !== audio) element.pause();
		});
	}


</script>

<style>
	article { margin: 0 0 1em 0; max-width: 800px }

	audio { width: 100%; margin: 0.5em 0 1em 0; }
	.playing { color: #ff3e00; }
</style>

<article class:playing={!paused}>
<slot></slot>

	<audio
		bind:this={audio}
		bind:paused
		on:play={stopOthers}
		controls
		{id}
		{src}
	></audio>
</article>