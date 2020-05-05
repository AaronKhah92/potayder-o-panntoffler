<script>


import { url } from '@sveltech/routify'
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

<h1 class="skane-title">Skåne föör faaaan!!</h1>

<div class="uk-container">

</div>

<div class="skane-map">
  <img class="skane-img" data-src="../../public/images/skane.svg"  alt="" uk-svg>
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

.skane-title {
  text-align: center;
}

  .skane-map {
  display: inline-block;
  margin: 50px 500px;
  position: relative;
  }

</style>