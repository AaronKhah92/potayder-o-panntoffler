<script>
  import Audioplayer from "../../components/audioplayer.svelte";
  import Cardinfo from "../../components/cardinfo.svelte";
  import Modal from "../../components/modal.svelte";
  import JamshogMarker from "../markers/citiesin/blekinge/Jamshog.svelte";
</script>

<Modal modalid="modal-youngwoman-jamshog" modaltitle="Skåne">
  <Audioplayer
    id="jamshog-yw"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/jamshog/youngwoman.mp3">
    <Cardinfo title="Jämshög" agetitle="Ung" gender="kvinna" city="Jämshög" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldwoman-jamshog" modaltitle="Skåne">
  <Audioplayer
    id="jamshog-ym"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/jamshog/oldwoman.mp3">
    <Cardinfo title="Jämshög" agetitle="Äldre" gender="Kvinna" city="Jämshög" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-youngman-jamshog" modaltitle="Skåne">
  <Audioplayer
    id="jamshog-ow"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/jamshog/youngman.mp3">
    <Cardinfo title="Jämshög" agetitle="Ung" gender="man" city="Jämshög" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldman-jamshog" modaltitle="Skåne">
  <Audioplayer
    id="jamshog-om"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/jamshog/oldman.mp3">
    <Cardinfo title="Jämshög" agetitle="Äldre" gender="man" city="Jämshög" />
  </Audioplayer>
</Modal>
