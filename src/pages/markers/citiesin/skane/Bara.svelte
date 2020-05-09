<script>

export let cityName;


import Audioplayer from '../../../../components/audioplayer.svelte'; 

import Cardinfo from '../../../../components/cardinfo.svelte';



</script>

 

  

    



    <div id="young-bara" >
      <a  href="#modal-youngwoman-bara" uk-toggle><img id="youngwo-bara" alt="bara"
      uk-tooltip={cityName} class="bara-marker" data-src="../images/marker-small.png" uk-img></a>
  
      <a  href="#modal-youngman-bara" uk-toggle><img id="youngm-bara" alt="bara"
      uk-tooltip={cityName} class="bara-marker" data-src="../images/marker-small.png" uk-img></a>
    </div>


    
    <div id="old-bara" >
      <a  href="#modal-oldwoman-bara" uk-toggle><img id="oldwo-bara" alt="bara"
      uk-tooltip={cityName} class="bara-marker" data-src="../images/marker-small.png" uk-img></a>
  
      <a  href="#modal-oldman-bara" uk-toggle><img id="oldm-bara" alt="bara"
      uk-tooltip={cityName} class="bara-marker" data-src="../images/marker-small.png" uk-img></a>
    </div>





<style>

#oldwo-bara.bara-marker,
#youngwo-bara.bara-marker {
  position: absolute;
  top: 67%;
  left: 35%;
  width: 25px;
  height: 25px;
  filter: hue-rotate(-100deg)
}

#oldm-bara.bara-marker,
#youngm-bara.bara-marker {
  position: absolute;
  top: 67%;
  left: 38%;
  width: 25px;
  height: 25px;
}



</style>