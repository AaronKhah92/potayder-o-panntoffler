<script>
  import Audioplayer from "../../components/audioplayer.svelte";
  import Cardinfo from "../../components/cardinfo.svelte";
  import Modal from "../../components/modal.svelte";
  import SorundaMarker from "../markers/citiesin/stockholm/Sorunda.svelte";
</script>

<Modal modalid="modal-youngwoman-sorunda" modaltitle="Skåne">
  <Audioplayer
    id="sorunda-yw"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/sorunda/youngwoman.mp3">
    <Cardinfo title="Sorunda" agetitle="Ung" gender="kvinna" city="Sorunda" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldwoman-sorunda" modaltitle="Skåne">
  <Audioplayer
    id="sorunda-ym"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/sorunda/oldwoman.mp3">
    <Cardinfo title="Sorunda" agetitle="Ung" gender="man" city="Sorunda" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-youngman-sorunda" modaltitle="Skåne">
  <Audioplayer
    id="sorunda-ow"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/sorunda/youngman.mp3">
    <Cardinfo title="Sorunda" agetitle="Äldre" gender="kvinna" city="Sorunda" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldman-sorunda" modaltitle="Skåne">
  <Audioplayer
    id="sorunda-om"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/sorunda/oldman.mp3">
    <Cardinfo title="Sorunda" agetitle="Äldre" gender="man" city="Sorunda" />
  </Audioplayer>
</Modal>
