<template>
  <div class="page-content">

    <!-- HEADER -->
    <div class="ptb">
      <div class="page-header-block">
        <div>
          <p class="pt">Bibliothèque des PFE</p>
          <p class="ps">Projets de fin d'études — Mention Très Bien</p>
        </div>
        <div class="header-stats">
          <span class="count-badge">{{ filteredPFE.length }} projets</span>
        </div>
      </div>
    </div>

    <!-- EMPTY STATE -->
    <div v-if="filteredPFE.length === 0" class="empty-state">
      <div class="empty-icon">📚</div>
      <p>Aucun projet disponible</p>
    </div>

    <!-- GRID -->
    <div class="pfe-grid">
      <div v-for="(pfe, index) in filteredPFE" :key="index" class="pfe-card">

        <!-- TOP: year + mention -->
        <div class="card-top">
          <span class="year-tag">{{ pfe.annee }}</span>
          <span :class="['mention-badge', getMentionClass(pfe.note)]">{{ getMention(pfe.note) }}</span>
        </div>

        <!-- AVATAR + name -->
        <div class="card-identity">
          <div class="student-avatar">{{ pfe.nom.split(' ').map(w => w[0]).join('').slice(0,2) }}</div>
          <div class="student-info">
            <span class="student-name">{{ pfe.nom }}</span>
          </div>
        </div>

        <!-- Subject -->
        <p class="pfe-subject">{{ pfe.sujet }}</p>

        <!-- Footer -->
        <div class="card-footer">
          <div class="note-display">
            <span class="note-num">{{ pfe.note }}</span>
            <span class="note-denom">/20</span>
          </div>
          <a :href="pfe.rapport" target="_blank" class="btn-report">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Voir rapport
          </a>
        </div>

      </div>
    </div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      archives: [
        { nom: "Ali Ben Salah",     annee: "2023/2024", sujet: "IA appliquée au diagnostic médical et analyse des données patients", note: 17, rapport: "/rapports/ali.pdf" },
        { nom: "Yassine Amri",      annee: "2023/2024", sujet: "IoT pour smart city et gestion intelligente du trafic urbain", note: 18, rapport: "/rapports/yassine.pdf" },
        { nom: "Sara Ben Youssef",  annee: "2022/2023", sujet: "Blockchain pour sécurisation des transactions bancaires", note: 16, rapport: "/rapports/sara.pdf" },
        { nom: "Mohamed Ali",       annee: "2022/2023", sujet: "Détection d'intrusion réseau basée sur Machine Learning", note: 17, rapport: "/rapports/mohamed.pdf" },
        { nom: "Nour Jabeur",       annee: "2023/2024", sujet: "Application mobile de gestion de stage universitaire", note: 15, rapport: "/rapports/nour.pdf" },
        { nom: "Omar Trabelsi",     annee: "2021/2022", sujet: "Reconnaissance faciale pour contrôle d'accès sécurisé", note: 19, rapport: "/rapports/omar.pdf" }
      ]
    }
  },
  computed: {
    filteredPFE() { return this.archives.filter(p => this.getMention(p.note) === "Très Bien") }
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
.count-badge { background: rgba(245,197,24,0.15); color: #b8880e; font-size: 13px; font-weight: 700; padding: 6px 14px; border-radius: 20px; border: 1.5px solid rgba(245,197,24,0.3); }

/* Empty */
.empty-state { text-align: center; padding: 60px; color: #8a9aaa; }
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-state p { font-size: 16px; font-weight: 600; color: #4a5a6a; margin: 0; }

/* Grid */
.pfe-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }

.pfe-card {
  background: #ddd9d1;
  border: 1.5px solid #c8c4bc;
  border-radius: 16px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}
.pfe-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4a7090, #f5a623);
  opacity: 0;
  transition: opacity 0.25s;
}
.pfe-card:hover { transform: translateY(-4px); box-shadow: 0 10px 28px rgba(0,0,0,0.1); border-color: #3d6080; }
.pfe-card:hover::before { opacity: 1; }

.card-top { display: flex; justify-content: space-between; align-items: center; }
.year-tag { font-size: 11.5px; font-weight: 700; color: #7A8FA6; background: rgba(61,96,128,0.08); padding: 3px 9px; border-radius: 20px; }

.mention-badge { padding: 3px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 700; }
.mention-tb  { background: rgba(39,174,96,0.12);  color: #27ae60; }
.mention-b   { background: rgba(61,96,128,0.12);  color: #3d6080; }
.mention-ab  { background: rgba(245,197,24,0.15); color: #b8880e; }
.mention-p   { background: rgba(245,166,35,0.12); color: #d98e1a; }
.mention-aj  { background: rgba(217,83,79,0.12);  color: #c0392b; }

.card-identity { display: flex; align-items: center; gap: 10px; }
.student-avatar { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #4a7090, #f5a623); color: white; font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.student-name { font-weight: 700; font-size: 14.5px; color: #1e2a35; }

.pfe-subject { font-size: 13px; color: #4a5a6a; line-height: 1.55; margin: 0; flex: 1; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; }

.card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; padding-top: 12px; border-top: 1px solid #c8c4bc; }
.note-display { display: flex; align-items: baseline; gap: 1px; }
.note-num { font-family: 'Merriweather', serif; font-size: 22px; font-weight: 700; color: #1e2a35; }
.note-denom { font-size: 13px; color: #8a9aaa; }

.btn-report { display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; color: #f5a623; text-decoration: none; transition: color 0.2s; }
.btn-report:hover { color: #d98e1a; }

@media (max-width: 768px) { .pfe-grid { grid-template-columns: 1fr; } }
</style>