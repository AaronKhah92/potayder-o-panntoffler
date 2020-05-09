<script>

export let cityName;


import Audioplayer from '../../../../components/audioplayer.svelte'; 

import Cardinfo from '../../../../components/cardinfo.svelte';



</script>

 

  

    



    <div id="young-norrarorom" >
      <a  href="#modal-youngwoman-norrarorom" uk-toggle><img id="youngwo-norrarorom" alt="norrarorom"
      uk-tooltip={cityName} class="norrarorom-marker" data-src="../images/marker-small.png" uk-img></a>
  
      <a  href="#modal-youngman-norrarorom" uk-toggle><img id="youngm-norrarorom" alt="norrarorom"
      uk-tooltip={cityName} class="norrarorom-marker" data-src="../images/marker-small.png" uk-img></a>
    </div>


    
    <div id="old-norrarorom" >
      <a  href="#modal-oldwoman-norrarorom" uk-toggle><img id="oldwo-norrarorom" alt="norrarorom"
      uk-tooltip={cityName} class="norrarorom-marker" data-src="../images/marker-small.png" uk-img></a>
  
      <a  href="#modal-oldman-norrarorom" uk-toggle><img id="oldm-norrarorom" alt="norrarorom"
      uk-tooltip={cityName} class="norrarorom-marker" data-src="../images/marker-small.png" uk-img></a>
    </div>



<style>

#oldwo-norrarorom.norrarorom-marker,
#youngwo-norrarorom.norrarorom-marker {
  position: absolute;
  top: 40%;
  left: 40%;
  width: 25px;
  height: 25px;
  filter: hue-rotate(-100deg)
}

#oldm-norrarorom.norrarorom-marker,
#youngm-norrarorom.norrarorom-marker {
  position: absolute;
  top: 40%;
  left: 37%;
  width: 25px;
  height: 25px;

}


</style>