<script>
  import { url } from "@sveltech/routify";
  import Lanna from "./markers/citiesin/stockholm/Lanna.svelte";
  import Sorunda from "./markers/citiesin/stockholm/Sorunda.svelte";
  import Vingaker from "./markers/citiesin/stockholm/Vvingaker.svelte";

  import Audioplayer from "../components/audioplayer.svelte";
  import Changebutton from "../components/changebutton.svelte";

  import LannaCity from "../pages/stockholm-cities/lanna-city.svelte";
  import SorundaCity from "../pages/stockholm-cities/sorunda-city.svelte";
  import VingakerCity from "../pages/stockholm-cities/vingaker-city.svelte";
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

  .stockholm-map {
    width: 34%;
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

  <div class="uk-card uk-card-default uk-child-width-1 uk-grid-match">
    <div class="uk-card-header">
      <div class="uk-grid-small uk-flex-middle" uk-grid>
        <div class="uk-width-expand">
          <h3 class="uk-card-title uk-margin-remove-bottom">
            Stockholm, där en falafel kostar 100kr
          </h3>
        </div>
      </div>
    </div>
    <div class="uk-card-body">
      <p>Stockholm är mitt Hjääartaa</p>

      <Changebutton targetCityName="Lanna" targetCityId="#old-lanna" />
      <Changebutton targetCityName="Sorunda" targetCityId="#old-sorunda" />
      <Changebutton
        targetCityName="Västra Vingåker"
        targetCityId="#old-vingaker" />
    </div>
  </div>

  <div class="stockholm-map">
    <img
      class="stockholm-img"
      data-src="../../images/stockholm.svg"
      alt=""
      uk-svg />
    <Lanna />
    <Sorunda />
    <Vingaker />
  </div>

  <div class="uk-card uk-card-default uk-grid-collapse " uk-grid>
    <div class="uk-card-media-left uk-cover-container">
      <img src="./../images/stockholm.jpg" alt="" uk-cover />
      <canvas width="600" height="400" />
    </div>
    <div>
      <div id="mediaplayer" class="uk-card-body">
        <h3 class="uk-card-title">Stockholm</h3>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt.
        </p>
      </div>
    </div>
  </div>
</div>

<LannaCity />
<SorundaCity />
<VingakerCity />
