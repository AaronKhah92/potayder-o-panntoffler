<script>

export let cityName;


import Audioplayer from '../../../../components/audioplayer.svelte'; 

import Cardinfo from '../../../../components/cardinfo.svelte';



</script>

 

  

    



    <div id="young-broby" >
      <a  href="#modal-youngwoman-broby" uk-toggle><img id="youngwo-broby" alt="broby"
      uk-tooltip={cityName} class="broby-marker" data-src="../images/marker-small.png" uk-img></a>
  
      <a  href="#modal-youngman-broby" uk-toggle><img id="youngm-broby" alt="broby"
      uk-tooltip={cityName} class="broby-marker" data-src="../images/marker-small.png" uk-img></a>
    </div>


    
    <div id="old-broby" >
      <a  href="#modal-oldwoman-broby" uk-toggle><img id="oldwo-broby" alt="broby"
      uk-tooltip={cityName} class="broby-marker" data-src="../images/marker-small.png" uk-img></a>
  
      <a  href="#modal-oldman-broby" uk-toggle><img id="oldm-broby" alt="broby"
      uk-tooltip={cityName} class="broby-marker" data-src="../images/marker-small.png" uk-img></a>
    </div>


<style>

#oldwo-broby.broby-marker,
#youngwo-broby.broby-marker {
  position: absolute;
  top: 17%;
  left: 75%;
  width: 25px;
  height: 25px;
  filter: hue-rotate(-100deg)
}

#oldm-broby.broby-marker,
#youngm-broby.broby-marker {
  position: absolute;
  top: 17%;
  left: 73%;
  width: 25px;
  height: 25px;
}


</style>