<script>
  import Audioplayer from "../../components/audioplayer.svelte";
  import Cardinfo from "../../components/cardinfo.svelte";
  import Modal from "../../components/modal.svelte";
  import HallevikMarker from "../markers/citiesin/blekinge/Hallevik.svelte";
</script>

<Modal modalid="modal-youngwoman-hallevik" modaltitle="Skåne">
  <Audioplayer
    id="hallevik-yw"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/hallevik/youngwoman.mp3">
    <Cardinfo title="Hallevik" agetitle="Ung" gender="kvinna" city="Hallevik" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldwoman-hallevik" modaltitle="Skåne">
  <Audioplayer
    id="hallevik-ym"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/hallevik/oldwoman.mp3">
    <Cardinfo
      title="Hallevik"
      agetitle="Äldre"
      gender="kvinna"
      city="Hallevik" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-youngman-hallevik" modaltitle="Skåne">
  <Audioplayer
    id="hallevik-ow"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/hallevik/youngman.mp3">
    <Cardinfo title="Hallevik" agetitle="Ung" gender="man" city="Hallevik" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldman-hallevik" modaltitle="Skåne">
  <Audioplayer
    id="hallevik-om"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/hallevik/oldman.mp3">
    <Cardinfo title="Hallevik" agetitle="Äldre" gender="man" city="Hallevik" />
  </Audioplayer>
</Modal>
