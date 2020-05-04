<!-- Logic -->

<script>
    import { Router, Route, NotFound, redirect } from "./pager";
    import Map from './components/Map.svelte';

    import Skane from "./pages/Skane.svelte";
    import Blekinge from "./pages/Blekinge.svelte";
    import Kalmar from "./pages/Kalmar.svelte";
    import Stockholm from "./pages/Stockholm.svelte";
</script>

<!-- Markup  --> 
<!-- <nav class="uk-navbar-container" uk-navbar>
    <div class="uk-navbar-left">

        <ul class="uk-navbar-nav">
            <li class="uk-active"><a href="#">Active</a></li>
            <li>
                <a href="#">Parent</a>
                <div class="uk-navbar-dropdown">
                    <ul class="uk-nav uk-navbar-dropdown-nav">
                        <li class="uk-active"><a href="#">Active</a></li>
                        <li><a href="#">Item</a></li>
                        <li><a href="#">Item</a></li>
                    </ul>
                </div>
            </li>
            <li><a href="#">Item</a></li>
        </ul>

    </div>
</nav>

<div class="uk-container">


</div> -->

<style>
  main {
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }

  nav a {
    padding-right: 3rem;
  }
</style>

<main>
  <nav class="uk-navbar uk-navbar-container ">
    <a href="/">Home</a>
    <a href="/skane">Skåne</a>
    <a href="/blekinge">Blekinge</a>
    <a href="/kalmar">Kalmar</a>
    <a href="/stockholm">Stockholm</a>
  </nav>

  <Router>
    <Route path="/" component={Map}  />
    <Route path="/skane" component={Skane} />
    <Route path="/blekinge" component={Blekinge} />
    <Route path="/kalmar" component={Kalmar}/>
    <Route path="/stockholm" component={Stockholm}/>
    <NotFound>
      <h2>Sorry. Page not found.</h2>
    </NotFound>
  </Router>

</main>

<!-- Styling -->

<!-- <style>
 
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  text-align: center;
}



</style> -->