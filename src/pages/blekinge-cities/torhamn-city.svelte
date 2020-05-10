<script>
  import Audioplayer from "../../components/audioplayer.svelte";
  import Cardinfo from "../../components/cardinfo.svelte";
  import Modal from "../../components/modal.svelte";
  import TorhamnMarker from "../markers/citiesin/blekinge/Torhamn.svelte";
</script>

<Modal modalid="modal-youngwoman-torhamn" modaltitle="Skåne">
  <Audioplayer
    id="torhamn-yw"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/torhamn/youngwoman.mp3">
    <Cardinfo title="Torhamn" agetitle="Ung" gender="kvinna" city="Torhamn" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldwoman-torhamn" modaltitle="Skåne">
  <Audioplayer
    id="torhamn-ym"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/torhamn/oldwoman.mp3">
    <Cardinfo title="Torhamn" agetitle="Ung" gender="man" city="Torhamn" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-youngman-torhamn" modaltitle="Skåne">
  <Audioplayer
    id="torhamn-ow"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/torhamn/youngman.mp3">
    <Cardinfo title="Torhamn" agetitle="Äldre" gender="kvinna" city="Torhamn" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldman-torhamn" modaltitle="Skåne">
  <Audioplayer
    id="torhamn-om"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/torhamn/oldman.mp3">
    <Cardinfo title="Torhamn" agetitle="Äldre" gender="man" city="Torhamn" />
  </Audioplayer>
</Modal>
