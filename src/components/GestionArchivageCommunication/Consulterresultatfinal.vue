<template>
  <div class="page-content">

    <!-- HEADER -->
    <div class="ptb">
      <div class="page-header-block">
        <div>
          <p class="pt">Résultats des soutenances</p>
          <p class="ps">Consultation et gestion des notes finales</p>
        </div>
        <button class="btn-gold" @click="archiverResultats">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 8v13H3V8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
          Archiver les résultats
        </button>
      </div>

      <!-- Success toast inline -->
      <transition name="fade-down">
        <div v-if="successMessage" class="success-inline">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          {{ successMessage }}
        </div>
      </transition>
    </div>

    <!-- FILTERS -->
    <div class="filter-row">
      <button
        v-for="f in filters"
        :key="f.value"
        class="filter-btn"
        :class="{ active: selectedFilter === f.value }"
        @click="setFilter(f.value)"
      >
        {{ f.label }}
        <span class="filter-count">{{ countFor(f.value) }}</span>
      </button>
    </div>

    <!-- TABLE -->
    <div class="table-card">
      <table class="table">
        <thead>
          <tr>
            <th>Étudiant</th>
            <th class="th-center">Note /20</th>
            <th class="th-center">Mention</th>
          </tr>
        </thead>
        <tbody>
          <tr class="table-row" v-for="etudiant in filteredEtudiants" :key="etudiant.id">
            <td>
              <div class="student-cell">
                <div class="student-av">{{ etudiant.nom.charAt(0) }}</div>
                <span class="user-nom">{{ etudiant.nom }}</span>
              </div>
            </td>
            <td class="td-center">
              <span class="note-pill">{{ etudiant.note }}/20</span>
            </td>
            <td class="td-center">
              <span :class="['mention-badge', getMentionClass(etudiant.note)]">{{ getMention(etudiant.note) }}</span>
            </td>
          </tr>
          <tr v-if="filteredEtudiants.length === 0">
            <td colspan="3" class="empty-row">Aucun étudiant dans cette catégorie</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      etudiants: [
        { id: 1, nom: "Etudiant 1", note: 14 },
        { id: 2, nom: "Etudiant 2", note: 10 },
        { id: 3, nom: "Etudiant 3", note: 17 },
        { id: 4, nom: "Etudiant 4", note: 12 }
      ],
      filters: [
        { label: "Tous",       value: "Tous" },
        { label: "Très Bien",  value: "Très Bien" },
        { label: "Bien",       value: "Bien" },
        { label: "Assez Bien", value: "Assez Bien" },
        { label: "Passable",   value: "Passable" },
        { label: "Ajourné",    value: "Ajourné" }
      ],
      selectedFilter: "Tous",
      successMessage: "",
      timer: null
    }
  },
  computed: {
    filteredEtudiants() {
      if (this.selectedFilter === "Tous") return this.etudiants
      return this.etudiants.filter(e => this.getMention(e.note) === this.selectedFilter)
    }
  },
  methods: {
    getMention(note) {
      if (note >= 16) return "Très Bien"
      if (note >= 14) return "Bien"
      if (note >= 12) return "Assez Bien"
      if (note >= 10) return "Passable"
      return "Ajourné"
    },
    getMentionClass(note) {
      if (note >= 16) return "mention-tb"
      if (note >= 14) return "mention-b"
      if (note >= 12) return "mention-ab"
      if (note >= 10) return "mention-p"
      return "mention-aj"
    },
    setFilter(value) { this.selectedFilter = value },
    countFor(value) {
      if (value === "Tous") return this.etudiants.length
      return this.etudiants.filter(e => this.getMention(e.note) === value).length
    },
    archiverResultats() {
      console.log("Archive :", { date: new Date(), data: this.etudiants })
      this.successMessage = "Résultats archivés avec succès"
      clearTimeout(this.timer)
      this.timer = setTimeout(() => { this.successMessage = "" }, 3000)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Source+Sans+3:wght@300;400;600;700&display=swap');
* { font-family: 'Source Sans 3', sans-serif; box-sizing: border-box; }

.page-content { padding: 0; }

/* Header */
.ptb { margin-bottom: 28px; }
.pt { font-family: 'Merriweather', serif; font-size: 24px; font-weight: 700; color: #1e2a35; margin: 0 0 5px; }
.ps { font-size: 14px; color: #7A8FA6; margin: 0; }
.page-header-block { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; }

/* Button gold */
.btn-gold { display: flex; align-items: center; gap: 7px; background: linear-gradient(135deg, #f5a623, #d98e1a); color: white; border: none; border-radius: 10px; padding: 10px 18px; font-size: 13.5px; font-weight: 700; cursor: pointer; font-family: 'Source Sans 3', sans-serif; transition: all 0.2s; box-shadow: 0 2px 8px rgba(245,166,35,0.25); }
.btn-gold:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(245,166,35,0.35); }

/* Success inline */
.success-inline { display: inline-flex; align-items: center; gap: 7px; background: rgba(39,174,96,0.12); color: #27ae60; border: 1.5px solid rgba(39,174,96,0.25); padding: 7px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; margin-top: 8px; }
.fade-down-enter-active { transition: all 0.25s ease; }
.fade-down-leave-active { transition: all 0.15s ease; }
.fade-down-enter-from { opacity: 0; transform: translateY(-6px); }
.fade-down-leave-to { opacity: 0; }

/* Filters */
.filter-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.filter-btn { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border: 1.5px solid #c8c4bc; border-radius: 20px; background: #ddd9d1; color: #4a5a6a; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Source Sans 3', sans-serif; transition: all 0.18s; }
.filter-btn:hover { border-color: #3d6080; color: #3d6080; }
.filter-btn.active { background: linear-gradient(135deg, #4a7090, #2f4f6a); color: white; border-color: transparent; box-shadow: 0 2px 8px rgba(61,96,128,0.25); }
.filter-btn.active .filter-count { background: rgba(255,255,255,0.2); color: white; }
.filter-count { background: rgba(61,96,128,0.1); color: #3d6080; font-size: 11px; font-weight: 700; padding: 1px 7px; border-radius: 20px; }

/* Table */
.table-card { background: #ddd9d1; border: 1.5px solid #c8c4bc; border-radius: 14px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.table { width: 100%; border-collapse: collapse; }
.table th { background: #f0ede8; padding: 11px 16px; font-size: 11.5px; font-weight: 700; color: #4a5a6a; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; }
.th-center { text-align: center; }
.table td { padding: 13px 16px; border-top: 1px solid #c8c4bc; font-size: 13.5px; }
.table-row:hover td { background: rgba(61,96,128,0.04); }
.td-center { text-align: center; }
.empty-row { text-align: center; padding: 32px; color: #8a9aaa; font-style: italic; }

.student-cell { display: flex; align-items: center; gap: 10px; }
.student-av { width: 34px; height: 34px; border-radius: 9px; background: rgba(245,197,24,0.18); color: #3d6080; font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.user-nom { font-weight: 600; color: #1e2a35; font-size: 14px; }

.note-pill { background: rgba(61,96,128,0.1); color: #3d6080; font-weight: 700; font-size: 13px; padding: 3px 10px; border-radius: 20px; }

.mention-badge { padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.mention-tb  { background: rgba(39,174,96,0.12);  color: #27ae60; }
.mention-b   { background: rgba(61,96,128,0.12);  color: #3d6080; }
.mention-ab  { background: rgba(245,197,24,0.15); color: #b8880e; }
.mention-p   { background: rgba(245,166,35,0.12); color: #d98e1a; }
.mention-aj  { background: rgba(217,83,79,0.12);  color: #c0392b; }
</style>