<script>



import Skane from './Skane.svelte';
import Blekinge from './Blekinge.svelte';
import Kalmar from './Kalmar.svelte';
import Stockholm from './Stockholm.svelte';
</script>



<div class="uk-container swemap">
	<img class="map-img" data-src="../images/sweden-map.svg"  alt="" uk-svg>
  <Stockholm/>
  <Kalmar/>
  <Blekinge/>
  <Skane/>
</div>





<style>
.swemap {
  display: inline-block;
  margin: 50px 300px;
  position: relative;
}

.map-img {
  max-width: 100%;
  display: block;
}


</style>