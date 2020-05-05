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

<h1>Karlshamn är rätt nice, havsvy o så.</h1>

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

</style>

