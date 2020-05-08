<script>

import { url } from '@sveltech/routify'
import Ankarsrum from './markers/citiesin/kalmar/Ankarsrum.svelte';
import Torsas from './markers/citiesin/kalmar/Torsas.svelte';


import Audioplayer, { stopAll } from '../components/audioplayer.svelte'; 
</script>

  <nav class="uk-navbar-container" uk-nav>
    <div class="uk-navbar-center">
      <ul class="uk-navbar-nav">
        <li class="uk-parent">
          <a href={$url('/')}>Startsida</a>
        </li>
        <li class="uk-parent">
          <a href={$url('/skane')}>Skåne</a>
        </li>
        <li class="uk-parent">
          <a href={$url('/blekinge')}>Blekinge</a>
        </li>
        <li class="uk-parent">
          <a href={$url('/kalmar')}>Kalmar</a>
        </li>
        <li class="uk-parent">
          <a href={$url('/stockholm')}>Stockholm</a>
        </li>
      </ul>
    </div>
  </nav>



<div class="flex-container">
  <div class="uk-card uk-card-default uk-width-1-2@m">
      <div class="uk-card-header">
          <div class="uk-grid-small uk-flex-middle" uk-grid>
              <div class="uk-width-expand">
                  <h3 class="uk-card-title uk-margin-remove-bottom">Kalmar,storstadskomplex deluxe</h3>
              </div>
          </div>
      </div>
      <div class="uk-card-body">
          <p>Kalmar är stort o fint, och har öland som är nice på sommmaren.</p>
      </div>
  </div>


  
  
<div class="kalmar-map">
  <img class="kalmar-img" data-src="../../images/kalmar.svg"  alt="" uk-svg>
  <Ankarsrum/>
  <Torsas/>
</div>

  

  
    <div class="uk-card uk-card-default uk-grid-collapse " uk-grid>
      <div class="uk-card-media-left uk-cover-container">
          <img src="https://placekitten.com/660/360" alt="" uk-cover>
          <canvas width="600" height="400"></canvas>
      </div>
      <div>
          <div class="uk-card-body">
              <h3 class="uk-card-title">Media Left</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.</p>
          </div>
      </div>
    </div>
</div>



<style>



.uk-navbar-container {
  background-color:#C6ECFF;
}
.uk-navbar-center {
  justify-content: center;
}

.uk-parent >  a {
  color: #0978AB;
  margin-right: 40px;
  font-size: 18px;
}

.flex-container {
  display: flex;
  flex-flow: row wrap;
  }

.uk-card  {
  display: block;
  background-color:  #fafad2;
  width: 25%;
}

.uk-navbar-container {
  background-color:#C6ECFF;
}
.uk-navbar-center {
  justify-content: center;
}

.uk-parent >  a {
  color: #0978AB;
  margin-right: 40px;
  font-size: 18px;
}

  .kalmar-map {
  width: 22%;
  margin-right: 14%;
  margin-left: 14%;
  box-sizing: border-box;
  display: inline-block;
  position: relative;
  border: 40px solid #fafad2;
  }

</style>