<script>
  export let cityName;

  import Audioplayer from "../../../../components/audioplayer.svelte";
  import Cardinfo from "../../../../components/cardinfo.svelte";
</script>

<style>
  #oldwo-vingaker.vingaker-marker,
  #youngwo-vingaker.vingaker-marker {
    position: absolute;
    top: 73%;
    left: 15%;
    width: 25px;
    height: 25px;
    filter: hue-rotate(-100deg);
  }

  #oldm-vingaker.vingaker-marker,
  #youngm-vingaker.vingaker-marker {
    position: absolute;
    top: 73%;
    left: 12%;
    width: 25px;
    height: 25px;
  }
</style>

<div id="young-vingaker">
  <a href="#modal-youngwoman-vingaker" uk-toggle>
    <img
      id="youngwo-vingaker"
      alt="vingaker"
      uk-tooltip={cityName}
      class="vingaker-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>

  <a href="#modal-youngman-vingaker" uk-toggle>
    <img
      id="youngm-vingaker"
      alt="vingaker"
      uk-tooltip={cityName}
      class="vingaker-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>
</div>

<div id="old-vingaker">
  <a href="#modal-oldwoman-vingaker" uk-toggle>
    <img
      id="oldwo-vingaker"
      alt="vingaker"
      uk-tooltip={cityName}
      class="vingaker-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>

  <a href="#modal-oldman-vingaker" uk-toggle>
    <img
      id="oldm-vingaker"
      alt="vingaker"
      uk-tooltip={cityName}
      class="vingaker-marker"
      data-src="../images/marker-small.png"
      uk-img />
  </a>
</div>
