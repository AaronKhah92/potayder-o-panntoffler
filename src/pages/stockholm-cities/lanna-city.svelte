<script>
  import Audioplayer from "../../components/audioplayer.svelte";
  import Cardinfo from "../../components/cardinfo.svelte";
  import Modal from "../../components/modal.svelte";
  import LannaMarker from "../markers/citiesin/stockholm/Lanna.svelte";
</script>

<Modal modalid="modal-youngwoman-lanna" modaltitle="Skåne">
  <Audioplayer
    id="lanna-yw"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/lanna/youngwoman.mp3">
    <Cardinfo title="Lanna" agetitle="Ung" gender="kvinna" city="Lanna" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldwoman-lanna" modaltitle="Skåne">
  <Audioplayer
    id="lanna-ym"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/lanna/oldwoman.mp3">
    <Cardinfo title="Lanna" agetitle="Ung" gender="man" city="Lanna" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-youngman-lanna" modaltitle="Skåne">
  <Audioplayer
    id="lanna-ow"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/lanna/youngman.mp3">
    <Cardinfo title="Lanna" agetitle="Äldre" gender="kvinna" city="Lanna" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldman-lanna" modaltitle="Skåne">
  <Audioplayer
    id="lanna-om"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/lanna/oldman.mp3">
    <Cardinfo title="Lanna" agetitle="Äldre" gender="man" city="Lanna" />
  </Audioplayer>
</Modal>
