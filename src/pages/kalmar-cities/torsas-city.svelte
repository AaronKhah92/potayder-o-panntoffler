<script>
  import Audioplayer from "../../components/audioplayer.svelte";
  import Cardinfo from "../../components/cardinfo.svelte";
  import Modal from "../../components/modal.svelte";
  import TorsasMarker from "../markers/citiesin/kalmar/Torsas.svelte";
</script>

<Modal modalid="modal-youngwoman-torsas" modaltitle="Skåne">
  <Audioplayer
    id="torsas-yw"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/torsas/youngwoman.mp3">
    <Cardinfo title="Torsås" agetitle="Ung" gender="kvinna" city="Torsås" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldwoman-torsas" modaltitle="Skåne">
  <Audioplayer
    id="torsas-ym"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/torsas/oldwoman.mp3">
    <Cardinfo title="Torsås" agetitle="Äldre" gender="kvinna" city="Torsås" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-youngman-torsas" modaltitle="Skåne">
  <Audioplayer
    id="torsas-ow"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/torsas/youngman.mp3">
    <Cardinfo title="Torsås" agetitle="Ung" gender="man" city="Torsås" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldman-torsas" modaltitle="Skåne">
  <Audioplayer
    id="torsas-om"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/torsas/oldman.mp3">
    <Cardinfo title="Torsås" agetitle="Äldre" gender="man" city="Torsås" />
  </Audioplayer>
</Modal>
