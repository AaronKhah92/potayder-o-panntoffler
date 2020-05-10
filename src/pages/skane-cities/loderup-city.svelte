<script>
  import Audioplayer from "../../components/audioplayer.svelte";
  import Cardinfo from "../../components/cardinfo.svelte";
  import Modal from "../../components/modal.svelte";
  import LoderupMarker from "../markers/citiesin/skane/Loderup.svelte";
</script>

<Modal modalid="modal-youngwoman-loderup" modaltitle="Skåne">
  <Audioplayer
    id="loderup-yw"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/loderup/youngwoman.mp3">
    <Cardinfo title="Löderup" agetitle="Ung" gender="kvinna" city="Löderup" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldwoman-loderup" modaltitle="Skåne">
  <Audioplayer
    id="loderup-ym"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/loderup/youngman.mp3">
    <Cardinfo title="Löderup" agetitle="Ung" gender="man" city="Löderup" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-youngman-loderup" modaltitle="Skåne">
  <Audioplayer
    id="loderup-ow"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/loderup/oldwoman.mp3">
    <Cardinfo title="Löderup" agetitle="Äldre" gender="kvinna" city="Löderup" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldman-loderup" modaltitle="Skåne">
  <Audioplayer
    id="loderup-om"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/loderup/oldman.mp3">
    <Cardinfo title="Löderup" agetitle="Äldre" gender="man" city="Löderup" />
  </Audioplayer>
</Modal>
