<script>
  export let cityName;

  import Audioplayer from "../../../../components/audioplayer.svelte";
  import Cardinfo from "../../../../components/cardinfo.svelte";
</script>

<style>
  #oldwo-lanna.lanna-marker,
  #youngwo-lanna.lanna-marker {
    position: absolute;
    top: 62%;
    left: 38%;
    width: 25px;
    height: 25px;
    filter: hue-rotate(-100deg);
  }

  #oldm-lanna.lanna-marker,
  #youngm-lanna.lanna-marker {
    position: absolute;
    top: 62%;
    left: 35%;
    width: 25px;
    height: 25px;
  }
</style>

<div id="young-lanna">
  <a href="#modal-youngwoman-lanna" uk-toggle>
    <img
      id="youngwo-lanna"
      alt="lanna"
      uk-tooltip={cityName}
      class="lanna-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>

  <a href="#modal-youngman-lanna" uk-toggle>
    <img
      id="youngm-lanna"
      alt="lanna"
      uk-tooltip={cityName}
      class="lanna-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>
</div>

<div id="old-lanna">
  <a href="#modal-oldwoman-lanna" uk-toggle>
    <img
      id="oldwo-lanna"
      alt="lanna"
      uk-tooltip={cityName}
      class="lanna-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>

  <a href="#modal-oldman-lanna" uk-toggle>
    <img
      id="oldm-lanna"
      alt="lanna"
      uk-tooltip={cityName}
      class="lanna-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>
</div>
