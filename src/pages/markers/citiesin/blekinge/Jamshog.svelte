<script>
  export let cityName;

  import Audioplayer from "../../../../components/audioplayer.svelte";
  import Cardinfo from "../../../../components/cardinfo.svelte";
</script>

<style>
  #oldwo-jamshog.jamshog-marker,
  #youngwo-jamshog.jamshog-marker {
    position: absolute;
    top: 48%;
    left: 13%;
    width: 25px;
    height: 25px;
    filter: hue-rotate(-100deg);
  }

  #oldm-jamshog.jamshog-marker,
  #youngm-jamshog.jamshog-marker {
    position: absolute;
    top: 48%;
    left: 10%;
    width: 25px;
    height: 25px;
  }
</style>

<div id="young-jamshog">
  <a href="#modal-youngwoman-jamshog" uk-toggle>
    <img
      id="youngwo-jamshog"
      alt="jamshog"
      uk-tooltip={cityName}
      class="jamshog-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>

  <a href="#modal-youngman-jamshog" uk-toggle>
    <img
      id="youngm-jamshog"
      alt="jamshog"
      uk-tooltip={cityName}
      class="jamshog-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>
</div>

<div id="old-jamshog">
  <a href="#modal-oldwoman-jamshog" uk-toggle>
    <img
      id="oldwo-jamshog"
      alt="jamshog"
      uk-tooltip={cityName}
      class="jamshog-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>

  <a href="#modal-oldman-jamshog" uk-toggle>
    <img
      id="oldm-jamshog"
      alt="jamshog"
      uk-tooltip={cityName}
      class="jamshog-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>
</div>
