<script>
  export let cityName;

  import Audioplayer from "../../../../components/audioplayer.svelte";
  import Cardinfo from "../../../../components/cardinfo.svelte";
</script>

<style>
  #oldwo-ankarsrum.ankarsrum-marker,
  #youngwo-ankarsrum.ankarsrum-marker {
    position: absolute;
    top: 22%;
    left: 43%;
    width: 25px;
    height: 25px;
    filter: hue-rotate(-100deg);
  }

  #oldm-ankarsrum.ankarsrum-marker,
  #youngm-ankarsrum.ankarsrum-marker {
    position: absolute;
    top: 22%;
    left: 40%;
    width: 25px;
    height: 25px;
  }
</style>

<div id="young-ankarsrum">
  <a href="#modal-youngwoman-ankarsrum" uk-toggle>
    <img
      id="youngwo-ankarsrum"
      alt="ankarsrum"
      uk-tooltip={cityName}
      class="ankarsrum-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>

  <a href="#modal-youngman-ankarsrum" uk-toggle>
    <img
      id="youngm-ankarsrum"
      alt="ankarsrum"
      uk-tooltip={cityName}
      class="ankarsrum-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>
</div>

<div id="old-ankarsrum">
  <a href="#modal-oldwoman-ankarsrum" uk-toggle>
    <img
      id="oldwo-ankarsrum"
      alt="ankarsrum"
      uk-tooltip={cityName}
      class="ankarsrum-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>

  <a href="#modal-oldman-ankarsrum" uk-toggle>
    <img
      id="oldm-ankarsrum"
      alt="ankarsrum"
      uk-tooltip={cityName}
      class="ankarsrum-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>
</div>
