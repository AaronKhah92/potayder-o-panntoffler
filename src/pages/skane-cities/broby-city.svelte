<script>

import Audioplayer  from '../../components/audioplayer.svelte'; 
import Cardinfo from '../../components/cardinfo.svelte';
import Modal from '../../components/modal.svelte';
import BrobyMarker from '../markers/citiesin/skane/Broby.svelte'



</script>



<Modal modalid="modal-youngwoman-broby" modaltitle="Skåne">
  <Audioplayer id="broby-yw"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/broby/youngwoman.mp3">
    <Cardinfo title="Broby" agetitle="Ung" gender="kvinna" city="Broby" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldwoman-broby" modaltitle="Skåne">
  <Audioplayer id="broby-ym"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/broby/youngman.mp3">
    <Cardinfo title="Broby" agetitle="Ung" gender="man" city="Broby" />
  </Audioplayer>
</Modal>




<Modal modalid="modal-youngman-broby" modaltitle="Skåne">
  <Audioplayer id="broby-ow"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/broby/oldwoman.mp3">
    <Cardinfo title="Broby" agetitle="Äldre" gender="kvinna" city="Broby" />
  </Audioplayer>
</Modal>

<Modal modalid="modal-oldman-broby" modaltitle="Skåne">
  <Audioplayer id="broby-om"
    src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/broby/oldman.mp3">
    <Cardinfo title="Broby" agetitle="Äldre" gender="man" city="Broby" />
  </Audioplayer>
</Modal>
