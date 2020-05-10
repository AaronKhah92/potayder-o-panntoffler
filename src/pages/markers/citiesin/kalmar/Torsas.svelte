<script>
  export let cityName;

  import Audioplayer from "../../../../components/audioplayer.svelte";
  import Cardinfo from "../../../../components/cardinfo.svelte";
</script>

<style>
  #oldwo-torsas.torsas-marker,
  #youngwo-torsas.torsas-marker {
    position: absolute;
    top: 89%;
    left: 28%;
    width: 25px;
    height: 25px;
    filter: hue-rotate(-100deg);
  }

  #oldm-torsas.torsas-marker,
  #youngm-torsas.torsas-marker {
    position: absolute;
    top: 89%;
    left: 23%;
    width: 25px;
    height: 25px;
  }
</style>

<div id="young-torsas">
  <a href="#modal-youngwoman-torsas" uk-toggle>
    <img
      id="youngwo-torsas"
      alt="torsas"
      uk-tooltip={cityName}
      class="torsas-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>

  <a href="#modal-youngman-torsas" uk-toggle>
    <img
      id="youngm-torsas"
      alt="torsas"
      uk-tooltip={cityName}
      class="torsas-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>
</div>

<div id="old-torsas">
  <a href="#modal-oldwoman-torsas" uk-toggle>
    <img
      id="oldwo-torsas"
      alt="torsas"
      uk-tooltip={cityName}
      class="torsas-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>

  <a href="#modal-oldman-torsas" uk-toggle>
    <img
      id="oldm-torsas"
      alt="torsas"
      uk-tooltip={cityName}
      class="torsas-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>
</div>
