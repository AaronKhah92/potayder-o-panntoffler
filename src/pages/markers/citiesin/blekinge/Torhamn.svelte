<script>
  export let cityName;

  import Audioplayer from "../../../../components/audioplayer.svelte";
  import Cardinfo from "../../../../components/cardinfo.svelte";
</script>

<style>
  #oldwo-torhamn.torhamn-marker,
  #youngwo-torhamn.torhamn-marker {
    position: absolute;
    top: 68%;
    left: 86%;
    width: 25px;
    height: 25px;
    filter: hue-rotate(-100deg);
  }

  #oldm-torhamn.torhamn-marker,
  #youngm-torhamn.torhamn-marker {
    position: absolute;
    top: 68%;
    left: 83%;
    width: 25px;
    height: 25px;
  }
</style>

<div id="young-torhamn">
  <a href="#modal-youngwoman-torhamn" uk-toggle>
    <img
      id="youngwo-torhamn"
      alt="torhamn"
      uk-tooltip={cityName}
      class="torhamn-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>

  <a href="#modal-youngman-torhamn" uk-toggle>
    <img
      id="youngm-torhamn"
      alt="torhamn"
      uk-tooltip={cityName}
      class="torhamn-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>
</div>

<div id="old-torhamn">
  <a href="#modal-oldwoman-torhamn" uk-toggle>
    <img
      id="oldwo-torhamn"
      alt="torhamn"
      uk-tooltip={cityName}
      class="torhamn-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>

  <a href="#modal-oldman-torhamn" uk-toggle>
    <img
      id="oldm-torhamn"
      alt="torhamn"
      uk-tooltip={cityName}
      class="torhamn-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>
</div>
