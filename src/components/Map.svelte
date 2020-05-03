<script>
import SkaneMarker from './markers/Skane-marker.svelte';
import BlekingeMarker from './markers/Blekinge-marker.svelte';
import KalmarMarker from './markers/Kalmar-marker.svelte';
import StockholmMarker from './markers/Stockholm-marker.svelte';
</script>



<div class="uk-container swemap">
	<img class="map-img" data-src="../images/sweden-map.svg"  alt="" uk-svg>
  <StockholmMarker/>
  <KalmarMarker/>
  <BlekingeMarker/>
  <SkaneMarker/>
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