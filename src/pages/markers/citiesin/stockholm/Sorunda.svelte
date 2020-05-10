<script>
  export let cityName;

  import Audioplayer from "../../../../components/audioplayer.svelte";
  import Cardinfo from "../../../../components/cardinfo.svelte";
</script>

<style>
  #oldwo-sorunda.sorunda-marker,
  #youngwo-sorunda.sorunda-marker {
    position: absolute;
    top: 75%;
    left: 57%;
    width: 25px;
    height: 25px;
    filter: hue-rotate(-100deg);
  }

  #oldm-sorunda.sorunda-marker,
  #youngm-sorunda.sorunda-marker {
    position: absolute;
    top: 75%;
    left: 54%;
    width: 25px;
    height: 25px;
  }
</style>

<div id="young-sorunda">
  <a href="#modal-youngwoman-sorunda" uk-toggle>
    <img
      id="youngwo-sorunda"
      alt="sorunda"
      uk-tooltip={cityName}
      class="sorunda-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>

  <a href="#modal-youngman-sorunda" uk-toggle>
    <img
      id="youngm-sorunda"
      alt="sorunda"
      uk-tooltip={cityName}
      class="sorunda-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>
</div>

<div id="old-sorunda">
  <a href="#modal-oldwoman-sorunda" uk-toggle>
    <img
      id="oldwo-sorunda"
      alt="sorunda"
      uk-tooltip={cityName}
      class="sorunda-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>

  <a href="#modal-oldman-sorunda" uk-toggle>
    <img
      id="oldm-sorunda"
      alt="sorunda"
      uk-tooltip={cityName}
      class="sorunda-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>
</div>
