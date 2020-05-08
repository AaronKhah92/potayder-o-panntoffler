<script>

export let cityName;
let genders = {man:false};
function toggleGen() {
  genders.man = !genders.man;
}

let ages = {old: false};
function toggleAge() {
  ages.old = !ages.old;
}
import Audioplayer, { playMarker } from '../../../../components/audioplayer.svelte'; 

import Cardinfo from '../../../../pages/cardinfo.svelte';



</script>

 

  
  {#if genders.man}
    
    <a  href="#modal-youngwoman-bjuv" uk-toggle><img on:click={playMarker} alt="bjuv"
    uk-tooltip={cityName} class="bjuv-marker" data-src="../images/marker-small.png" uk-img></a>

    <button on:click={toggleGen}>
      w
    </button>
  {/if}


    {#if !genders.man}

       <a class="" href="#modal-youngman-bjuv" uk-toggle><img on:click={playMarker} alt="bjuv"
    uk-tooltip={cityName} class="bjuv-marker" data-src="../images/marker-small.png" uk-img></a>

    <button on:click={toggleGen}>
       m
    </button>
  {/if}

   
  {#if ages.old}
    
    <a  href="#modal-oldwoman-bjuv" uk-toggle><img on:click={playMarker} alt="bjuv"
    uk-tooltip={cityName} class="bjuv-marker" data-src="../images/marker-small.png" uk-img></a>

    <button on:click={toggleAge}>
      y
    </button>
  {/if}


    {#if !ages.old}

       <a class="" href="#modal-oldman-bjuv" uk-toggle><img on:click={playMarker} alt="bjuv"
    uk-tooltip={cityName} class="bjuv-marker" data-src="../images/marker-small.png" uk-img></a>

    <button on:click={toggleAge}>
        o
    </button>
  {/if}



<style>

.bjuv-marker {
  position: absolute;
  top: 37%;
  left: 22%;
  width: 25px;
  height: 25px;
}

button {
  height: 4px;
}



</style>

