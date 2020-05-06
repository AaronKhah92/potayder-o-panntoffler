<!-- Logic -->

<script>
    import { Router } from '@sveltech/routify';
    import { routes } from '@sveltech/routify/tmp/routes';
    import { url } from '@sveltech/routify';
</script>

<Router {routes}/>


<style>

   :global(body) {
/*         background-color: #f2eee2;
        transition: background-color 0.3s */
        background-image: url("../../images/WoodTexture.svg");
        background-repeat: no-repeat;
        margin: 0;
        padding: 0;
        min-height: 100vh;
   }
</style>