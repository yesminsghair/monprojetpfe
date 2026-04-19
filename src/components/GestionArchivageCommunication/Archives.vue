<template>
  <div class="page-content">

    <!-- HEADER -->
    <div class="ptb">
      <div class="page-header-block">
        <div>
          <p class="pt">Archives des résultats</p>
          <p class="ps">Consultation des résultats archivés par période</p>
        </div>
        <div class="header-badge">
          <span class="archive-count-badge">{{ archives.length }} archives</span>
        </div>
      </div>
    </div>

    <!-- SEARCH -->
    <div class="search-wrapper">
      <div class="search-input-wrap">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" class="search-input" placeholder="Rechercher un étudiant ou une archive..." />
      </div>
    </div>

    <!-- EMPTY STATE -->
    <div v-if="filteredArchives.length === 0" class="empty-state">
      <div class="empty-icon">🗄️</div>
      <p>Aucune archive trouvée</p>
      <span>Essayez un autre terme de recherche</span>
    </div>

    <!-- ARCHIVE LIST -->
    <div v-for="(archive, index) in filteredArchives" :key="index" class="archive-box">

      <!-- ARCHIVE HEADER -->
      <div class="archive-header">
        <div class="archive-header-left">
          <div class="archive-icon-wrap">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8v13H3V8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
          </div>
          <div>
            <span class="archive-date">Archive du {{ formatDate(archive.date) }}</span>
            <span class="archive-meta">{{ archive.data.length }} étudiants</span>
          </div>
        </div>
        <button v-if="isDirecteur" class="btn-danger-sm" @click="supprimerArchive(index)">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          Supprimer
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
            <tr class="table-row" v-for="e in archive.data" :key="e.id">
              <td>
                <div class="student-cell">
                  <div class="av-blue">{{ e.nom.charAt(0) }}</div>
                  <span class="user-nom">{{ e.nom }}</span>
                </div>
              </td>
              <td class="td-center">
                <span class="note-pill">{{ e.note }}/20</span>
              </td>
              <td class="td-center">
                <span :class="['mention-badge', getMentionClass(e.note)]">{{ getMention(e.note) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>

  </div>
</template>

<script>
export default {
  props: {
    role: { type: String, default: "chef" }
  },
  data() {
    return {
      search: "",
      archives: [
        {
          date: new Date(),
          data: [
            { id: 1, nom: "Ali Ben Salah", note: 14 },
            { id: 2, nom: "Yassine Amri", note: 10 }
          ]
        },
        {
          date: new Date(Date.now() - 86400000 * 30),
          data: [
            { id: 3, nom: "Sara Ben Youssef", note: 17 }
          ]
        }
      ]
    }
  },
  computed: {
    isDirecteur() { return this.role === "directeur" },
    filteredArchives() {
      if (!this.search) return this.archives
      const s = this.search.toLowerCase()
      return this.archives
        .map(archive => ({ ...archive, data: archive.data.filter(e => e.nom.toLowerCase().includes(s)) }))
        .filter(archive => archive.data.length > 0)
    }
  },
  methods: {
    supprimerArchive(index) { this.archives.splice(index, 1) },
    formatDate(date) { return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
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
.page-header-block { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
.archive-count-badge { background: rgba(61,96,128,0.1); color: #3d6080; font-size: 13px; font-weight: 700; padding: 6px 14px; border-radius: 20px; }

/* Search */
.search-wrapper { margin-bottom: 24px; }
.search-input-wrap { position: relative; max-width: 480px; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #8a9aaa; }
.search-input { width: 100%; padding: 10px 14px 10px 40px; background: #ddd9d1; border: 1.5px solid #c8c4bc; border-radius: 10px; font-size: 14px; color: #1e2a35; outline: none; transition: border-color 0.2s; }
.search-input:focus { border-color: #3d6080; }
.search-input::placeholder { color: #8a9aaa; }

/* Empty state */
.empty-state { text-align: center; padding: 60px; color: #8a9aaa; line-height: 1.6; }
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-state p { font-size: 16px; font-weight: 600; color: #4a5a6a; margin: 0 0 4px; }
.empty-state span { font-size: 13px; }

/* Archive box */
.archive-box { margin-bottom: 20px; }
.archive-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding: 14px 18px; background: linear-gradient(160deg, #4a7090, #2f4f6a); border-radius: 12px 12px 0 0; }
.archive-header-left { display: flex; align-items: center; gap: 12px; }
.archive-icon-wrap { width: 34px; height: 34px; background: rgba(255,255,255,0.12); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #f5a623; flex-shrink: 0; }
.archive-date { display: block; font-size: 14px; font-weight: 700; color: white; }
.archive-meta { display: block; font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 2px; }

.btn-danger-sm { display: flex; align-items: center; gap: 6px; background: rgba(217,83,79,0.2); color: #ff8080; border: 1.5px solid rgba(217,83,79,0.35); border-radius: 8px; padding: 6px 12px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Source Sans 3', sans-serif; }
.btn-danger-sm:hover { background: rgba(217,83,79,0.35); color: #ffaaaa; }

/* Table */
.table-card { background: #ddd9d1; border: 1.5px solid #c8c4bc; border-top: none; border-radius: 0 0 12px 12px; overflow: hidden; }
.table { width: 100%; border-collapse: collapse; }
.table th { background: #f0ede8; padding: 11px 16px; font-size: 11.5px; font-weight: 700; color: #4a5a6a; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; }
.th-center { text-align: center; }
.table td { padding: 13px 16px; border-top: 1px solid #c8c4bc; font-size: 13.5px; }
.table-row:hover td { background: rgba(61,96,128,0.04); }
.td-center { text-align: center; }

.student-cell { display: flex; align-items: center; gap: 10px; }
.av-blue { width: 34px; height: 34px; border-radius: 9px; background: rgba(245,197,24,0.2); color: #3d6080; font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.user-nom { font-weight: 600; color: #1e2a35; font-size: 14px; }

.note-pill { background: rgba(61,96,128,0.1); color: #3d6080; font-weight: 700; font-size: 13px; padding: 3px 10px; border-radius: 20px; }

.mention-badge { padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.mention-tb  { background: rgba(39,174,96,0.12);  color: #27ae60; }
.mention-b   { background: rgba(61,96,128,0.12);  color: #3d6080; }
.mention-ab  { background: rgba(245,197,24,0.15); color: #b8880e; }
.mention-p   { background: rgba(245,166,35,0.12); color: #d98e1a; }
.mention-aj  { background: rgba(217,83,79,0.12);  color: #c0392b; }
</style>