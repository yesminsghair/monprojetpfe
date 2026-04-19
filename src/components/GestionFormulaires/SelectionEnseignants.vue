
<template>

<div class="page-content">

<h3>Choisir les enseignants destinataires</h3>

<div class="list">

<label v-for="ens in enseignants" :key="ens.id">

<input type="checkbox" :value="ens.id" v-model="selection">

{{ens.nom}} {{ens.prenom}}

</label>

</div>

<div class="form-actions">

<button class="btn-gold" @click="confirmer">
Confirmer
</button>

</div>

</div>

</template>

<script>
export default {
  name: 'SelectionnerEnseignants',

  props: {
    enseignants: { type: Array, default: () => [] }
  },

  emits: ['selection-validee'],

  data() {
    return {
      selection: []
    }
  },

  methods: {
    confirmer() {
      this.$emit('selection-validee', this.selection)
    }
  }
}
</script>
