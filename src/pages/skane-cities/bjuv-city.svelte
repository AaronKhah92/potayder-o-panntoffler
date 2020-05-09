<script>

import Audioplayer  from '../../components/audioplayer.svelte'; 
import Cardinfo from '../../components/cardinfo.svelte';
import Modal from '../../components/modal.svelte';
import BjuvMarker from '../markers/citiesin/skane/Bjuv.svelte'

/* function clickHandler() {
  let xOld = document.getElementById("old");
  let xYoung = document.getElementById("young");
  if (window.getComputedStyle(xOld).visibility !== "hidden") {
   let oldwoman = document.getElementById("oldwo")
   let oldman = document.getElementById("oldm")
    if(oldwoman) {
      oldwoman.click()
    }
    if(oldman) {
      oldman.click()
    }
  }

    if (window.getComputedStyle(xYoung).visibility !== "hidden") {
   let youngwoman = document.getElementById("youngwo")
   let youngman = document.getElementById("youngm")
    if(youngwoman) {
      youngwoman.click()
    }
    if(youngman) {
      youngman.click()
    }
  }
  

} */

</script>



<Modal modalid="modal-youngwoman-bjuv" modaltitle="Skåne">
  <Audioplayer id="bjuv-yw"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bjuv/youngwoman.mp3">
    <Cardinfo title="Bjuv" agetitle="Ung" gender="kvinna" city="Bjuv" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldwoman-bjuv" modaltitle="Skåne">
  <Audioplayer id="bjuv-ym"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bjuv/youngman.mp3">
    <Cardinfo title="Bjuv" agetitle="Ung" gender="man" city="Bjuv" />
  </Audioplayer>
</Modal>




<Modal modalid="modal-youngman-bjuv" modaltitle="Skåne">
  <Audioplayer id="bjuv-ow"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bjuv/oldwoman.mp3">
    <Cardinfo title="Bjuv" agetitle="Äldre" gender="kvinna" city="Bjuv" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldman-bjuv" modaltitle="Skåne">
  <Audioplayer id="bjuv-om"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bjuv/oldman.mp3">
    <Cardinfo title="Bjuv" agetitle="Äldre" gender="man" city="Bjuv" />
  </Audioplayer>
</Modal>
