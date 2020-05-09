<script>

export let cityName;


import Audioplayer from '../../../../components/audioplayer.svelte'; 

import Cardinfo from '../../../../components/cardinfo.svelte';



</script>

 

  

    



    <div id="young-loderup" >
      <a  href="#modal-youngwoman-loderup" uk-toggle><img id="youngwo-loderup" alt="loderup"
      uk-tooltip={cityName} class="loderup-marker" data-src="../images/marker-small.png" uk-img></a>
  
      <a  href="#modal-youngman-loderup" uk-toggle><img id="youngm-loderup" alt="loderup"
      uk-tooltip={cityName} class="loderup-marker" data-src="../images/marker-small.png" uk-img></a>
    </div>


    
    <div id="old-loderup" >
      <a  href="#modal-oldwoman-loderup" uk-toggle><img id="oldwo-loderup" alt="loderup"
      uk-tooltip={cityName} class="loderup-marker" data-src="../images/marker-small.png" uk-img></a>
  
      <a  href="#modal-oldman-loderup" uk-toggle><img id="oldm-loderup" alt="loderup"
      uk-tooltip={cityName} class="loderup-marker" data-src="../images/marker-small.png" uk-img></a>
    </div>



<style>

#oldwo-loderup.loderup-marker,
#youngwo-loderup.loderup-marker {
  position: absolute;
  top: 90%;
  left: 70%;
  width: 25px;
  height: 25px;
  filter: hue-rotate(-100deg);
}

#oldm-loderup.loderup-marker,
#youngm-loderup.loderup-marker {
  position: absolute;
  top: 90%;
  left: 67%;
  width: 25px;
  height: 25px;
}


</style>