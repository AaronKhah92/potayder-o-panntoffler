<script>
  export let targetCityId;
  export let targetCityName;
</script>

<style>
  .blue-btn {
    background-color: #c6ecff;
    padding: 8px 12px;
    margin: 5px 15px;
  }
</style>

<button
  class="uk-button-default blue-btn"
  type="button"
  uk-toggle="target: {targetCityId}">
  Ändra Åldersgrupp {targetCityName}
</button>
