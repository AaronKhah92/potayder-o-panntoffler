<script>

export let cityName;
let genders = {man:false};
function toggleGen() {
  genders.man = !genders.man;
}
import Audioplayer, { playMarker } from '../../../../components/audioplayer.svelte'; 

import Cardinfo from '../../../../pages/cardinfo.svelte';



</script>

 

  
  {#if genders.man}
    
    <a  href="#modal-woman" uk-toggle><img on:click={playMarker} alt="bara"
    uk-tooltip={cityName} class="bara-marker" data-src="../images/marker-small.png" uk-img></a>

    <button on:click={toggleGen}>
      m
    </button>
  {/if}


    {#if !genders.man}

       <a  href="#modal-man" uk-toggle><img on:click={playMarker} alt="bara"
    uk-tooltip={cityName} class="bara-marker" data-src="../images/marker-small.png" uk-img></a>

    <button on:click={toggleGen}>
        w
    </button>
  {/if}


<style>

.bara-marker {
  position: absolute;
  top: 67%;
  left: 35%;
  width: 25px;
  height: 25px;
}

button {
  height: 4px;
  display: none;
}



</style>