<script>


import { url } from '@sveltech/routify'
import Bara from './markers/citiesin/skane/Bara.svelte';
import Bjuv from './markers/citiesin/skane/Bjuv.svelte';
import Broby from './markers/citiesin/skane/Broby.svelte';
import Loderup from './markers/citiesin/skane/Loderup.svelte';
import Norrarorom from './markers/citiesin/skane/Norrarorom.svelte';
import Osssjo from './markers/citiesin/skane/Osssjo.svelte';
</script>

<nav class="uk-navbar-container" uk-nav>
  <div class="uk-navbar-center">
    <ul class="uk-navbar-nav">
      <li class="uk-parent">
        <a href={$url('/')}>Startsida </a> </li>
      <li class="uk-parent">
        <a href={$url('/skane')}>Skåne </a> </li>
      <li class="uk-parent">
        <a href={$url('/blekinge')}>Blekinge </a> </li>
      <li class="uk-parent">
        <a href={$url('/kalmar')}>Kalmar </a> </li>
      <li class="uk-parent">
        <a href={$url('/stockholm')}>Stockholm </a> </li>
    </ul>
  </div>
</nav>


<div class="flex-container">
  <div class="uk-card skane-title uk-card-default uk-width-1-2@m">
    <div class="uk-card-header">
      <div class="uk-grid-small uk-flex-middle" uk-grid>
        <div class="uk-width-expand">
          <h3 class="uk-card-title uk-margin-remove-bottom">Skåne föör faaaan!!</h3>
        </div>
      </div>
    </div>
    <div class="uk-card-body">
      <p>Är du intresserad av dialekter? I så fall har du kommit rätt, för här kan du lyssna på dialekter
        från hela det svenska språkområdet.</p>
    </div>
  </div>
  
  
  <div class="skane-map">
    <img class="skane-img" data-src="../../images/skane.svg" alt="" uk-svg>
    <Bara />
    <Bjuv />
    <Broby />
    <Loderup />
    <Norrarorom />
    <Osssjo />
  </div>
  
  
  
  
  <div class="uk-card uk-card-default uk-grid-collapse " uk-grid>
    <div class="uk-card-media-left uk-cover-container">
        <img src="https://placekitten.com/640/360" alt="" uk-cover>
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
      background-color: #C6ECFF;
    }

    .uk-navbar-center {
      justify-content: center;
    }

    .uk-parent>a {
      color: #0978AB;
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
      background-color: #C6ECFF;
    }

    .uk-navbar-center {
      justify-content: center;
    }

    .uk-parent>a {
      color: #0978AB;
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