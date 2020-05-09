<script>

export let targetCityId;
export let targetCityName;
</script>

<button class="uk-button-default blue-btn" type="button" uk-toggle="target: {targetCityId}">Ändra kön {targetCityName}</button>


<style>

.blue-btn {
  background-color: #C6ECFF;
  padding: 12px 12px;
  margin: 5px 15px
}

</style>