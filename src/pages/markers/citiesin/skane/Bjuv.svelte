<script>

export let cityName;


import Audioplayer from '../../../../components/audioplayer.svelte'; 

import Cardinfo from '../../../../components/cardinfo.svelte';



</script>

 

  

    



    <div id="young-bjuv" >
      <a  href="#modal-youngwoman-bjuv" uk-toggle><img id="youngwo-bjuv" alt="bjuv"
      uk-tooltip={cityName} class="bjuv-marker" data-src="../images/marker-small.png" uk-img></a>
  
      <a  href="#modal-youngman-bjuv" uk-toggle><img id="youngm-bjuv" alt="bjuv"
      uk-tooltip={cityName} class="bjuv-marker" data-src="../images/marker-small.png" uk-img></a>
    </div>


    
    <div id="old-bjuv" >
      <a  href="#modal-oldwoman-bjuv" uk-toggle><img id="oldwo-bjuv" alt="bjuv"
      uk-tooltip={cityName} class="bjuv-marker" data-src="../images/marker-small.png" uk-img></a>
  
      <a  href="#modal-oldman-bjuv" uk-toggle><img id="oldm-bjuv" alt="bjuv"
      uk-tooltip={cityName} class="bjuv-marker" data-src="../images/marker-small.png" uk-img></a>
    </div>










<style>

#oldwo-bjuv.bjuv-marker,
#youngwo-bjuv.bjuv-marker {
  position: absolute;
  top: 37%;
  left: 25%;
  width: 25px;
  height: 25px;
  filter: hue-rotate(-100deg)
}

#oldm-bjuv.bjuv-marker,
#youngm-bjuv.bjuv-marker {
  position: absolute;
  top: 37%;
  left: 22%;
  width: 25px;
  height: 25px;
  
}




</style>

