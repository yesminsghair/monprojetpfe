<template>
  <div class="recherche-bar">

    <!-- Recherche texte (US 17 - étape 3) -->
    <div class="search-wrap">
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input
        v-model="localRecherche"
        type="text"
        placeholder="Rechercher par nom, prénom ou email..."
        @input="$emit('update:recherche', localRecherche)"
      />
      <!-- US 17 - 3.b : Effacer -->
      <button v-if="localRecherche" class="clear-btn"
        @click="localRecherche = ''; $emit('update:recherche', '')"
        title="Effacer la recherche">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <!-- US 17 - 3.c : Filtre par spécialité -->
    <div class="select-wrap">
      <select :value="filtreSpecialite"
        @change="$emit('update:filtreSpecialite', $event.target.value ? Number($event.target.value) : '')">
        <option value="">Toutes les spécialités</option>
        <option v-for="sp in specialites" :key="sp.id" :value="sp.id">{{ sp.nom }}</option>
      </select>
      <svg class="select-icon" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
    </div>

    <!-- US 17 - 3.a : Filtres avancés toggle -->
    <button class="btn-filter" :class="{ active: showAvance }" @click="showAvance = !showAvance">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/></svg>
      Filtres avancés
    </button>

    <!-- US 17 - 6.a : Exporter -->
    <button class="btn-export" @click="$emit('exporter')" title="Exporter les résultats">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Exporter
    </button>

    <!-- Filtres avancés (US 17 - 3.a) -->
    <transition name="slide-down">
    <div v-if="showAvance" class="filtres-avances">
      <div class="filtre-avance-item">
        <label class="lbl-sm">Date d'affectation (après)</label>
        <input type="date" v-model="localDateDebut"
          @change="$emit('update:dateDebut', localDateDebut)"/>
      </div>
      <div class="filtre-avance-item">
        <label class="lbl-sm">Date d'affectation (avant)</label>
        <input type="date" v-model="localDateFin"
          @change="$emit('update:dateFin', localDateFin)"/>
      </div>
      <button class="btn-clear-avance" @click="clearFiltres">
        Réinitialiser les filtres
      </button>
    </div>
    </transition>

  </div>
</template>

<script>
export default {
  name: 'RechercherChef',
  props: {
    recherche:        { type: String, default: '' },
    filtreSpecialite: { type: [String, Number], default: '' },
    dateDebut:        { type: String, default: '' },
    dateFin:          { type: String, default: '' },
    specialites:      { type: Array,  default: () => [] },
  },
  emits: [
    'update:recherche',
    'update:filtreSpecialite',
    'update:dateDebut',
    'update:dateFin',
    'exporter',
  ],
  data() {
    return {
      localRecherche: this.recherche,
      localDateDebut: this.dateDebut,
      localDateFin:   this.dateFin,
      showAvance:     false,
    }
  },
  methods: {
    clearFiltres() {
      this.localRecherche = ''
      this.localDateDebut = ''
      this.localDateFin   = ''
      this.$emit('update:recherche', '')
      this.$emit('update:filtreSpecialite', '')
      this.$emit('update:dateDebut', '')
      this.$emit('update:dateFin', '')
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.recherche-bar {
  display: flex; align-items: center;
  gap: 10px; flex-wrap: wrap;
  margin-bottom: 18px;
  font-family: 'Source Sans 3', sans-serif;
  max-width: 860px; margin-left: auto; margin-right: auto;
  justify-content: center;
}

/* Search */
.search-wrap {
  display: flex; align-items: center; gap: 8px;
  background: #e8e4dc; border: 1.5px solid #c8c4bc;
  border-radius: 10px; padding: 0 12px; flex: 1; min-width: 220px;
  color: #8a9aaa; transition: border-color 0.2s, box-shadow 0.2s;
}
.search-wrap:focus-within { border-color: #3d6080; box-shadow: 0 0 0 3px rgba(61,96,128,0.12); }
.search-wrap input { flex: 1; padding: 10px 0; border: none; background: transparent; font-size: 14px; font-family: 'Source Sans 3', sans-serif; color: #1e2a35; outline: none; }
.search-wrap input::placeholder { color: #aaa49c; }
.clear-btn { background: none; border: none; cursor: pointer; color: #8a9aaa; display: flex; padding: 2px; width: auto; box-shadow: none; flex-shrink: 0; transition: color 0.15s; }
.clear-btn:hover { color: #c0392b; box-shadow: none; transform: none; }

/* Select spécialité */
.select-wrap { position: relative; }
.select-wrap select {
  padding: 10px 32px 10px 14px;
  background: #e8e4dc; border: 1.5px solid #c8c4bc;
  border-radius: 10px; font-size: 13.5px;
  font-family: 'Source Sans 3', sans-serif; color: #1e2a35;
  outline: none; appearance: none; cursor: pointer;
  transition: border-color 0.2s;
}
.select-wrap select:focus { border-color: #3d6080; box-shadow: 0 0 0 3px rgba(61,96,128,0.12); }
.select-icon { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #8a9aaa; }

/* Buttons */
.btn-filter {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 14px; border: 1.5px solid #c8c4bc;
  border-radius: 10px; background: #e8e4dc; color: #4a5a6a;
  font-size: 13px; font-family: 'Source Sans 3', sans-serif;
  cursor: pointer; transition: all 0.15s; white-space: nowrap;
  width: auto; box-shadow: none;
}
.btn-filter:hover { border-color: #3d6080; color: #3d6080; box-shadow: none; transform: none; }
.btn-filter.active { background: rgba(61,96,128,0.12); border-color: #3d6080; color: #3d6080; }

.btn-export {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 14px; border: 1.5px solid #c8c4bc;
  border-radius: 10px; background: #e8e4dc; color: #4a5a6a;
  font-size: 13px; font-family: 'Source Sans 3', sans-serif;
  cursor: pointer; transition: all 0.15s; white-space: nowrap;
  width: auto; box-shadow: none;
}
.btn-export:hover { border-color: #27ae60; color: #27ae60; box-shadow: none; transform: none; }

/* Filtres avancés */
.filtres-avances {
  width: 100%; display: flex; align-items: flex-end; gap: 14px;
  padding: 16px 18px; background: rgba(61,96,128,0.06);
  border: 1px solid rgba(61,96,128,0.15); border-radius: 10px;
  margin-top: 4px; flex-wrap: wrap;
}
.filtre-avance-item { display: flex; flex-direction: column; gap: 6px; }
.lbl-sm { font-size: 12px; font-weight: 600; color: #6a7a8a; text-transform: uppercase; letter-spacing: 0.04em; }
.filtres-avances input[type="date"] {
  padding: 8px 12px; background: #e8e4dc; border: 1.5px solid #c8c4bc;
  border-radius: 9px; font-size: 13.5px;
  font-family: 'Source Sans 3', sans-serif; color: #1e2a35;
  outline: none;
}
.filtres-avances input[type="date"]:focus { border-color: #3d6080; }

.btn-clear-avance {
  padding: 8px 16px; border: 1.5px solid #c8c4bc; border-radius: 9px;
  background: transparent; color: #c0392b; font-size: 13px;
  font-family: 'Source Sans 3', sans-serif; cursor: pointer; align-self: flex-end;
  transition: background 0.15s, border-color 0.15s; width: auto; box-shadow: none;
}
.btn-clear-avance:hover { background: rgba(192,57,43,0.07); border-color: #c0392b; box-shadow: none; transform: none; }

/* Transitions */
.slide-down-enter-active { transition: opacity 0.22s ease, transform 0.22s ease; }
.slide-down-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }
</style>