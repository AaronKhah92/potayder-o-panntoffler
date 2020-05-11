<script>
  import Audioplayer from "../../components/audioplayer.svelte";
  import Cardinfo from "../../components/cardinfo.svelte";
  import Modal from "../../components/modal.svelte";
  import KingMarker from "../markers/citiesin/skane/easteregg.svelte";
  import BoneMarker from "../markers/citiesin/skane/easteregg.svelte";
</script>

<Modal modalid="modal-king" modaltitle="Skåne">
  <Audioplayer
    id="malmo-ym"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/kungen.mp3">
    <Cardinfo title="Malmö" agetitle="Ung och Kung" gender="Man" city="Malmö" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-bone" modaltitle="Skåne Land">
  <Audioplayer
    id="skaneland-om"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bone.mp3">
    <Cardinfo
      title="Skåne Land"
      agetitle="Äldre man med traktor"
      gender=""
      city="Skåne Land" />
  </Audioplayer>
</Modal>
