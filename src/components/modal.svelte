<script>
export let modaltitle;
export let modalid;
</script>


<div id={modalid} uk-modal>
  <div class="uk-modal-dialog">
    <button class="uk-modal-close-default" type="button" uk-close></button>
    <div class="uk-modal-header">
      <h2 class="uk-modal-title">{modaltitle}</h2>
    </div>
    <div class="uk-modal-body">
          <slot></slot>
    </div>
    <div class="uk-modal-footer uk-text-right">
      <button class="uk-button uk-button-default uk-modal-close" type="button">Stäng</button>
    </div>
  </div>
</div>