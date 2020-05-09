<script>

import Audioplayer  from '../../components/audioplayer.svelte'; 
import Cardinfo from '../../components/cardinfo.svelte';
import Modal from '../../components/modal.svelte';
import BaraMarker from '../markers/citiesin/skane/Bara.svelte'

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



<Modal modalid="modal-youngwoman-bara" modaltitle="Skåne">
  <Audioplayer id="bara-yw"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bara/youngwoman.mp3">
    <Cardinfo title="Bara" agetitle="Ung" gender="kvinna" city="Bara" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldwoman-bara" modaltitle="Skåne">
  <Audioplayer id="bara-ym"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bara/youngman.mp3">
    <Cardinfo title="Bara" agetitle="Ung" gender="man" city="Bara" />
  </Audioplayer>
</Modal>




<Modal modalid="modal-youngman-bara" modaltitle="Skåne">
  <Audioplayer id="bara-ow"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bara/oldwoman.mp3">
    <Cardinfo title="Bara" agetitle="Äldre" gender="kvinna" city="Bara" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldman-bara" modaltitle="Skåne">
  <Audioplayer id="bara-om"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bara/oldman.mp3">
    <Cardinfo title="Bara" agetitle="Äldre" gender="man" city="Bara" />
  </Audioplayer>
</Modal>