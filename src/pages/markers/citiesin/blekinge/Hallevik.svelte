<script>
  export let cityName;

  import Audioplayer from "../../../../components/audioplayer.svelte";
  import Cardinfo from "../../../../components/cardinfo.svelte";
</script>

<style>
  #oldwo-hallevik.hallevik-marker,
  #youngwo-hallevik.hallevik-marker {
    position: absolute;
    top: 83%;
    left: 21%;
    width: 25px;
    height: 25px;
    filter: hue-rotate(-100deg);
  }

  #oldm-hallevik.hallevik-marker,
  #youngm-hallevik.hallevik-marker {
    position: absolute;
    top: 83%;
    left: 18%;
    width: 25px;
    height: 25px;
  }
</style>

<div id="young-hallevik">
  <a href="#modal-youngwoman-hallevik" uk-toggle>
    <img
      id="youngwo-hallevik"
      alt="hallevik"
      uk-tooltip={cityName}
      class="hallevik-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>

  <a href="#modal-youngman-hallevik" uk-toggle>
    <img
      id="youngm-hallevik"
      alt="hallevik"
      uk-tooltip={cityName}
      class="hallevik-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>
</div>

<div id="old-hallevik">
  <a href="#modal-oldwoman-hallevik" uk-toggle>
    <img
      id="oldwo-hallevik"
      alt="hallevik"
      uk-tooltip={cityName}
      class="hallevik-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>

  <a href="#modal-oldman-hallevik" uk-toggle>
    <img
      id="oldm-hallevik"
      alt="hallevik"
      uk-tooltip={cityName}
      class="hallevik-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>
</div>
