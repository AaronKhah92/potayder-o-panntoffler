<script>

export let cityName;


import Audioplayer from '../../../../components/audioplayer.svelte'; 

import Cardinfo from '../../../../components/cardinfo.svelte';



</script>

 

  

    



    <div id="young-osssjo" >
      <a  href="#modal-youngwoman-osssjo" uk-toggle><img id="youngwo-osssjo" alt="osssjo"
      uk-tooltip={cityName} class="osssjo-marker" data-src="../images/marker-small.png" uk-img></a>
  
      <a  href="#modal-youngman-osssjo" uk-toggle><img id="youngm-osssjo" alt="osssjo"
      uk-tooltip={cityName} class="osssjo-marker" data-src="../images/marker-small.png" uk-img></a>
    </div>


    
    <div id="old-osssjo" >
      <a  href="#modal-oldwoman-osssjo" uk-toggle><img id="oldwo-osssjo" alt="osssjo"
      uk-tooltip={cityName} class="osssjo-marker" data-src="../images/marker-small.png" uk-img></a>
  
      <a  href="#modal-oldman-osssjo" uk-toggle><img id="oldm-osssjo" alt="osssjo"
      uk-tooltip={cityName} class="osssjo-marker" data-src="../images/marker-small.png" uk-img></a>
    </div>



<style>

#oldwo-osssjo.osssjo-marker,
#youngwo-osssjo.osssjo-marker {
  position: absolute;
  top: 23%;
  left: 22%;
  width: 25px;
  height: 25px;
  filter: hue-rotate(-100deg)
}

#oldm-osssjo.osssjo-marker,
#youngm-osssjo.osssjo-marker {
  position: absolute;
  top: 23%;
  left: 19%;
  width: 25px;
  height: 25px;
}

</style>