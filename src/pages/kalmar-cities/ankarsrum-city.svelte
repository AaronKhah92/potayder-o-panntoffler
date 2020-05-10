<script>
  import Audioplayer from "../../components/audioplayer.svelte";
  import Cardinfo from "../../components/cardinfo.svelte";
  import Modal from "../../components/modal.svelte";
  import AnkarsrumMarker from "../markers/citiesin/kalmar/Ankarsrum.svelte";
</script>

<Modal modalid="modal-youngwoman-ankarsrum" modaltitle="Skåne">
  <Audioplayer
    id="anakarsrum-yw"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/ankarsrum/youngwoman.mp3">
    <Cardinfo
      title="Ankarsrum"
      agetitle="Ung"
      gender="kvinna"
      city="Ankarsrum" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldwoman-ankarsrum" modaltitle="Skåne">
  <Audioplayer
    id="ankarsrum-ym"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/ankarsrum/oldwoman.mp3">
    <Cardinfo
      title="Ankarsrum"
      agetitle="Äldre"
      gender="Kvinna"
      city="Ankarsrum" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-youngman-ankarsrum" modaltitle="Skåne">
  <Audioplayer
    id="ankarsrum-ow"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/ankarsrum/youngman.mp3">
    <Cardinfo title="Ankarsrum" agetitle="Ung" gender="man" city="Ankarsrum" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldman-ankarsrum" modaltitle="Skåne">
  <Audioplayer
    id="ankarsrum-om"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/ankarsrum/oldman.mp3">
    <Cardinfo
      title="Ankarsrum"
      agetitle="Äldre"
      gender="man"
      city="Ankarsrum" />
  </Audioplayer>
</Modal>
