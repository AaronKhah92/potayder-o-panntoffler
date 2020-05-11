<script>
  import Audioplayer from "../../../../components/audioplayer.svelte";

  import Cardinfo from "../../../../components/cardinfo.svelte";
</script>

<style>
  #youngm-malmo.king-marker {
    position: absolute;
    top: 78%;
    left: 24%;
    width: 25px;
    height: 25px;
  }

  #oldm-skaneland.bone-marker {
    position: absolute;
    top: 56%;
    left: 65%;
    width: 25px;
    height: 25px;
  }
</style>

<a href="#modal-king" uk-toggle>
  <img
    id="youngm-malmo"
    alt="bjuv"
    uk-tooltip="Jag är kungen, du vet."
    class="king-marker"
    data-src="../images/king.png"
    uk-img />
</a>

<a href="#modal-bone" uk-toggle>
  <img
    id="oldm-skaneland"
    alt="bjuv"
    uk-tooltip="den har powör"
    class="bone-marker"
    data-src="../images/power.png"
    uk-img />
</a>
