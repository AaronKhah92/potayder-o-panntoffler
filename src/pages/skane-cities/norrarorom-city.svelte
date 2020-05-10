<script>
  import Audioplayer from "../../components/audioplayer.svelte";
  import Cardinfo from "../../components/cardinfo.svelte";
  import Modal from "../../components/modal.svelte";
  import NorraroromMarker from "../markers/citiesin/skane/Norrarorom.svelte";
</script>

<Modal modalid="modal-youngwoman-norrarorom" modaltitle="Skåne">
  <Audioplayer
    id="norrarorom-yw"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/norrarorom/youngwoman.mp3">
    <Cardinfo
      title="Norra Rörum"
      agetitle="Ung"
      gender="kvinna"
      city="Norra Rörum" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldwoman-norrarorom" modaltitle="Skåne">
  <Audioplayer
    id="norrarorom-ym"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/norrarorom/youngman.mp3">
    <Cardinfo
      title="Norra Rörum"
      agetitle="Ung"
      gender="man"
      city="Norra Rörum" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-youngman-norrarorom" modaltitle="Skåne">
  <Audioplayer
    id="norrarorom-ow"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/norrarorom/oldwoman.mp3">
    <Cardinfo
      title="Norra Rörum"
      agetitle="Äldre"
      gender="kvinna"
      city="Norra Rörum" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldman-norrarorom" modaltitle="Skåne">
  <Audioplayer
    id="norrarorom-om"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/norrarorom/oldman.mp3">
    <Cardinfo
      title="Norra Rörum"
      agetitle="Äldre"
      gender="man"
      city="Norra Rörum" />
  </Audioplayer>
</Modal>
