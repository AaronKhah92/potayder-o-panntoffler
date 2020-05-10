<script>
  import Audioplayer from "../../components/audioplayer.svelte";
  import Cardinfo from "../../components/cardinfo.svelte";
  import Modal from "../../components/modal.svelte";
  import OsssjoMarker from "../markers/citiesin/skane/Osssjo.svelte";
</script>

<Modal modalid="modal-youngwoman-osssjo" modaltitle="Skåne">
  <Audioplayer
    id="osssjo-yw"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/osssjo/youngwoman.mp3">
    <Cardinfo title="Osssjö" agetitle="Ung" gender="kvinna" city="Osssjö" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldwoman-osssjo" modaltitle="Skåne">
  <Audioplayer
    id="osssjo-ym"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/osssjo/youngman.mp3">
    <Cardinfo title="Össjö" agetitle="Ung" gender="man" city="Össjö" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-youngman-osssjo" modaltitle="Skåne">
  <Audioplayer
    id="osssjo-ow"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/osssjo/oldwoman.mp3">
    <Cardinfo title="Össjö" agetitle="Äldre" gender="kvinna" city="Össjö" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldman-osssjo" modaltitle="Skåne">
  <Audioplayer
    id="osssjo-om"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/osssjo/oldman.mp3">
    <Cardinfo title="Össjö" agetitle="Äldre" gender="man" city="Össjö" />
  </Audioplayer>
</Modal>
