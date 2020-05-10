<script>
  import { url } from "@sveltech/routify";
  import Hallevik from "./markers/citiesin/blekinge/Hallevik.svelte";
  import Jamshog from "./markers/citiesin/blekinge/Jamshog.svelte";
  import Torhamn from "./markers/citiesin/blekinge/Torhamn.svelte";

  import Audioplayer from "../components/audioplayer.svelte";
  import Changebutton from "../components/changebutton.svelte";

  import HallevikCity from "../pages/blekinge-cities/hallevik-city.svelte";
  import JamshogCity from "../pages/blekinge-cities/jamshog-city.svelte";
  import TorhamnCity from "../pages/blekinge-cities/torhamn-city.svelte";
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

  .uk-card {
    display: block;
    background-color: #fafad2;
    width: 25%;
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

  .blekinge-map {
    width: 34%;
    height: 100%;
    margin-right: 8%;
    margin-left: 8%;
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
  <div class="uk-card uk-card-default uk-width-1-2@m">
    <div class="uk-card-header">
      <div class="uk-grid-small uk-flex-middle" uk-grid>
        <div class="uk-width-expand">
          <h3 class="uk-card-title uk-margin-remove-bottom">
            Blekinge, Smålands Skåne
          </h3>
        </div>
      </div>
    </div>
    <div class="uk-card-body">
      <p>Karlshamn är rätt nice, havsvy o så.</p>

      <Changebutton targetCityName="Hallevik" targetCityId="#old-hallevik" />
      <Changebutton targetCityName="Jämshög" targetCityId="#old-jamshog" />
      <Changebutton targetCityName="Torhamn" targetCityId="#old-torhamn" />

    </div>
  </div>

  <div class="blekinge-map">
    <img
      class="blekinge-img"
      data-src="../../images/blekinge.svg"
      alt=""
      uk-svg />
    <Hallevik />
    <Jamshog />
    <Torhamn />
  </div>

  <div class="uk-card uk-card-default uk-grid-collapse " uk-grid>
    <div class="uk-card-media-left uk-cover-container">
      <img src="https://placekitten.com/660/360" alt="" uk-cover />
      <canvas width="600" height="400" />
    </div>
    <div>
      <div class="uk-card-body">
        <h3 class="uk-card-title">Media Left</h3>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt.
        </p>
      </div>
    </div>
  </div>
</div>

<HallevikCity />
<JamshogCity />
<TorhamnCity />
