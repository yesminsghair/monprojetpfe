
<template>

<div class="modal-overlay">

<div class="modal-box">

<h3>Publier le formulaire</h3>

<p>
Êtes-vous sûr de vouloir publier ce formulaire ?
Les enseignants pourront répondre immédiatement.
</p>

<div class="modal-footer">

<button class="btn-gold" @click="publier">
Publier
</button>

<button class="btn-outline" @click="$emit('fermer')">
Annuler
</button>

</div>

</div>

</div>

</template>

<script>
export default{

props:{
formulaire:Object
},

emits:["publie"],

methods:{
publier(){

this.$emit("publie",this.formulaire.id)

}

}

}
</script>

