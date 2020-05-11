<script>
  import { url } from "@sveltech/routify";
  import SkaneMarker from "./markers/Skane-marker.svelte";
  import BlekingeMarker from "./markers/Blekinge-marker.svelte";
  import KalmarMarker from "./markers/Kalmar-marker.svelte";
  import StockholmMarker from "./markers/Stockholm-marker.svelte";
  "";
</script>

<style>
  .uk-card {
    display: block;
    width: 54.5vw;
    margin: 0 auto;
    background-color: #fafad2;
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

  .swemap {
    display: block;
    margin: 0 300px;
    position: relative;
  }

  .map-img {
    max-width: 100%;
    display: block;
    border: 40px solid #fafad2;
    border-top: 40px solid #ffffe5;
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

<div class="uk-card uk-card-default uk-width-1-2@m">
  <div class="uk-card-header">
    <div class="uk-grid-small uk-flex-middle" uk-grid>
      <div class="uk-width-expand">
        <h3 class="uk-card-title uk-margin-remove-bottom">
          100 svenska dialekter
        </h3>
      </div>
    </div>
  </div>
  <div class="uk-card-body">
    <p>
      Är du intresserad av dialekter? I så fall har du kommit rätt, för här kan
      du lyssna på dialekter från hela det svenska språkområdet.
    </p>
  </div>
</div>

<div class="uk-container swemap">
  <img class="map-img" data-src="../images/sweden-map.svg" alt="" uk-svg />
  <a href={$url('/stockholm')} class="nav-marker">
    <StockholmMarker />
  </a>
  <a href={$url('/kalmar')} class="mark-nav">
    <KalmarMarker />
  </a>
  <a href={$url('/blekinge')} class="mark-nav">
    <BlekingeMarker />
  </a>
  <a href={$url('/skane')} class="mark-nav">
    <SkaneMarker />
  </a>
</div>
