<script>
  import { url } from "@sveltech/routify";
  import Bara from "./markers/citiesin/skane/Bara.svelte";
  import Bjuv from "./markers/citiesin/skane/Bjuv.svelte";
  import Broby from "./markers/citiesin/skane/Broby.svelte";
  import Loderup from "./markers/citiesin/skane/Loderup.svelte";
  import Norrarorom from "./markers/citiesin/skane/Norrarorom.svelte";
  import Osssjo from "./markers/citiesin/skane/Osssjo.svelte";

  import BjuvCity from "../pages/skane-cities/bjuv-city.svelte";
  import BaraCity from "../pages/skane-cities/bara-city.svelte";
  import BrobyCity from "../pages/skane-cities/broby-city.svelte";
  import LoderupCity from "../pages/skane-cities/loderup-city.svelte";
  import NorraRoromCity from "../pages/skane-cities/norrarorom-city.svelte";
  import OsssjoCity from "../pages/skane-cities/osssjo-city.svelte";
  import Changebutton from "../components/changebutton.svelte";
</script>

<style>
  .uk-navbar-container {
    background-color: #c6ecff;
  }

  .uk-navbar-center {
    justify-content: center;
  }

  .uk-parent > a {
    color: #0978ab;
    margin-right: 40px;
    font-size: 18px;
  }

  .flex-container {
    display: flex;
    flex-flow: row wrap;
  }

  .uk-grid-collapse {
    width: 25%;
  }

  .skane-title {
    height: 458px !important;
  }

  .uk-card {
    display: block;
    background-color: #fafad2;
    width: 25%;
    height: 100%;
  }

  .uk-navbar-container {
    background-color: #c6ecff;
  }

  .uk-navbar-center {
    justify-content: center;
  }

  .uk-parent > a {
    color: #0978ab;
    margin-right: 40px;
    font-size: 18px;
  }

  .skane-map {
    width: 38%;
    overflow-x: hidden;
    margin-right: 6%;
    margin-left: 6%;
    box-sizing: border-box;
    display: inline-block;
    position: relative;
    border: 40px solid #fafad2;
  }
</style>

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
  <div
    class="uk-card skane-title uk-card-default uk-child-width-1 uk-grid-match">
    <div class="uk-card-header">
      <div class="uk-grid-small uk-flex-middle" uk-grid>
        <div class="uk-width-expand">
          <h3 class="uk-card-title uk-margin-remove-bottom">
            Skåne föör faaaan!!
          </h3>
        </div>
      </div>
    </div>
    <div class="uk-card-body">
      <p>Det regnar, men vädret är fin fint, jag klagade inte"</p>

      <Changebutton targetCityName="Bjuv" targetCityId="#old-bjuv" />
      <Changebutton targetCityName="Bara" targetCityId="#old-bara" />
      <Changebutton targetCityName="Broby" targetCityId="#old-broby" />
      <Changebutton targetCityName="Löderup" targetCityId="#old-loderup" />
      <Changebutton
        targetCityName="Norra rörum"
        targetCityId="#old-norrarorom" />
      <Changebutton targetCityName="Össsjö" targetCityId="#old-osssjo" />

    </div>
  </div>

  <div class="skane-map">
    <img class="skane-img" data-src="../../images/skane.svg" alt="" uk-svg />
    <Bara cityName="Bara" />
    <Bjuv cityName="Bjuv" />
    <Broby />
    <Loderup />
    <Norrarorom />
    <Osssjo />
  </div>

  <div class="uk-card uk-card-default uk-grid-collapse " uk-grid>
    <div class="uk-card-media-left uk-cover-container">
      <img src="../../images/skaneland.jpg" alt="" uk-cover />
      <canvas width="600" height="400" />
    </div>
    <div>
      <div class="uk-card-body">
        <h3 class="uk-card-title">Vackra Skåne</h3>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt.
        </p>
      </div>
    </div>
  </div>
</div>

<BjuvCity />
<BaraCity />
<BrobyCity />
<LoderupCity />
<NorraRoromCity />
<OsssjoCity />
