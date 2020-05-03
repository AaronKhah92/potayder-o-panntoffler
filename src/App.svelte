<!-- Logic -->

<script>
	
  import Map from './components/Map.svelte';
</script>

<!-- Markup  --> 
<nav class="uk-navbar-container" uk-navbar>
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


</div>

<Map/>


<!-- Styling -->

<style>
 
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  text-align: center;
}



</style>