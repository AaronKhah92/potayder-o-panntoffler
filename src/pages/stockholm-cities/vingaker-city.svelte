<script>
  import Audioplayer from "../../components/audioplayer.svelte";
  import Cardinfo from "../../components/cardinfo.svelte";
  import Modal from "../../components/modal.svelte";
  import VingakerMarker from "../markers/citiesin/stockholm/Vvingaker.svelte";
</script>

<Modal modalid="modal-youngwoman-vingaker" modaltitle="Skåne">
  <Audioplayer
    id="vingaker-yw"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/vingaker/youngwoman.mp3">
    <Cardinfo
      title="Västra Vingåker"
      agetitle="Ung"
      gender="kvinna"
      city="Västra Vingåker" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldwoman-vingaker" modaltitle="Skåne">
  <Audioplayer
    id="vingaker-ym"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/vingaker/oldwoman.mp3">
    <Cardinfo
      title="Västra Vingåker"
      agetitle="Ung"
      gender="man"
      city="Västra Vingåker" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-youngman-vingaker" modaltitle="Skåne">
  <Audioplayer
    id="vingaker-ow"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/vingaker/youngman.mp3">
    <Cardinfo
      title="Västra Vingåker"
      agetitle="Äldre"
      gender="kvinna"
      city="Västra Vingåker" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldman-vingaker" modaltitle="Skåne">
  <Audioplayer
    id="vingaker-om"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/vingaker/oldman.mp3">
    <Cardinfo
      title="Västra Vingåker"
      agetitle="Äldre"
      gender="man"
      city="Västra Vingåker" />
  </Audioplayer>
</Modal>
