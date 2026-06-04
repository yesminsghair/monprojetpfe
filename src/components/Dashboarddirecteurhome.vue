<template>
  <div class="home-wrap" ref="dashboardRoot">
<!-- header -->
    <div class="page-header"><!-- entete -->
      <div>
        <h1 class="page-title">Bonjour, {{ currentUser.prenom }} 👋</h1>
        <p class="page-sub">Tableau de bord GIMSI — Vue nationale des PFE</p>
      </div>

      <div class="header-meta">
        <span class="last-refresh">{{ heureActualisation }}</span>
        <button class="btn-refresh" @click="charger" :disabled="loading"><!-- buttonactualiser  appelle charger()-->
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" :class="{spinning: loading}"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Actualiser<!-- icone svg de refresh-->
        </button>
        <button class="btn-download" @click="telechargerPDF" :disabled="downloading || loading"><!-- btn telecharger pdf-->
          <!-- icone svg de download-->
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <!-- text en cours-->
          {{ downloading ? 'Export en cours…' : 'Télécharger PDF' }}
        </button>
      </div>
    </div>
<!--condition si on ai en cours de telechargement / spinner de chargement-->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div><p>Chargement des indicateurs...</p>
    </div>

    <template v-else><!-- sinon on affiche le template principal-->
<!--homepage: kpi+quick actions-->
      <template v-if="isHome">
        <!-- alerte s'ilya une grille en attente>0-->
      <div v-if="grillesEnAttente > 0" class="alert-warning">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <div class="aw-body">
          <div class="aw-title">{{ grillesEnAttente }} grille(s) en attente de validation</div>
          <div class="aw-sub">Des chefs ont soumis des grilles pour votre approbation.</div>
        </div><!-- boutton valider grille-->
        <button class="btn-warning" @click="$emit('navigate','grilles-validation')">Valider →</button>
      </div>

      <!--les cardes des kpi-->
      <div class="section-label">Indicateurs globaux</div>
      <div class="kpi-row"><!--conteneur des cartes kpi-->
        <!-- carte des spécialité -->
        <div class="kpi-card kpi-blue"><!-- icone dossier svg-->
          <div class="kpi-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>
          <div class="kpi-body"><div class="kpi-value">{{ kpi.totalSpecialites }}</div><div class="kpi-label">Spécialités</div></div>
        </div>
        <!-- carte des etudiants -->
        <div class="kpi-card kpi-slate"><!-- icone user svg-->
          <div class="kpi-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
          <div class="kpi-body"><div class="kpi-value">{{ kpi.totalEtudiants }}</div><div class="kpi-label">Étudiants</div></div>
        </div>
        <!--carte encadrants-->
        <div class="kpi-card kpi-teal"><!--icone livre-->
          <div class="kpi-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/></svg></div>
          <div class="kpi-body"><div class="kpi-value">{{ kpi.totalEncadrants }}</div><div class="kpi-label">Encadrants</div></div>
        </div>
        <!--carte soutenance totales-->
        <div class="kpi-card kpi-gold"><!--icone calendrier -->
          <div class="kpi-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
          <div class="kpi-body"><div class="kpi-value">{{ kpi.totalSoutenances }}</div><div class="kpi-label">Soutenances totales</div></div>
        </div>
        <!--soutenances réalisé -->
        <div class="kpi-card kpi-green"><!--icone done-->
          <div class="kpi-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div class="kpi-body"><div class="kpi-value">{{ kpi.soutenancesTerminees }}</div><div class="kpi-label">Soutenances réalisées</div></div>
        </div>
        <!--carte taux de reussites--><!--couleur par condition-->
        <div class="kpi-card" :class="kpi.tauxReussite >= 70 ? 'kpi-green' : 'kpi-red'">
          <div class="kpi-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          <div class="kpi-body"><div class="kpi-value">{{ kpi.tauxReussite }}%</div><div class="kpi-label">Taux de réussite global</div></div>
        </div>
      </div>

      <!-- section des actions rapides -->
      <div class="section-label">Actions rapides</div> <!--label de titre -->
      <div class="qa-grid"><!--section d'actipn rapide-->
        <!--boutton creer spécialité-->
        <button class="qa-card" @click="$emit('navigate','spec-create')"><!--icone svg + -->
          <div class="qa-icon qa-blue"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
          <div class="qa-txt"><div class="qa-t">Nouvelle spécialité</div><div class="qa-s">Créer une filière académique</div></div>
          <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <!--promouvoir d'un chef -->
        <button class="qa-card" @click="$emit('navigate','chef-create')">
          <div class="qa-icon qa-gold"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg></div>
          <div class="qa-txt"><div class="qa-t">Ajouter un chef</div><div class="qa-s">Nouveau chef de département</div></div>
          <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <!--les grilles en attente-->
        <button class="qa-card" @click="$emit('navigate','grilles-validation')">
          <div class="qa-icon" :class="grillesEnAttente>0 ? 'qa-red' : 'qa-teal'"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg></div>
          <div class="qa-txt"><div class="qa-t">Grilles d'évaluation</div><div class="qa-s">{{ grillesEnAttente > 0 ? grillesEnAttente + ' en attente' : 'Toutes validées' }}</div></div>
          <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <!--liste des spécialité -->
        <button class="qa-card" @click="$emit('navigate','spec-list')">
          <div class="qa-icon qa-slate"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></div>
          <div class="qa-txt"><div class="qa-t">Liste des spécialités</div><div class="qa-s">Consulter, modifier, supprimer</div></div>
          <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <!--consulter l'archive -->
        <button class="qa-card" @click="$emit('navigate','archives')">
          <div class="qa-icon qa-slate"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8v13H3V8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg></div>
          <div class="qa-txt"><div class="qa-t">Archives PFE</div><div class="qa-s">Consulter les PFE archivés</div></div>
          <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <!--consulter le tableau de board-->
        <button class="qa-card" @click="$emit('navigate','tableau-de-bord')">
          <div class="qa-icon qa-blue"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></div>
          <div class="qa-txt"><div class="qa-t">Tableau de bord</div><div class="qa-s">Graphiques et statistiques</div></div>
          <svg class="qa-arr" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      </template>


      <!-- les charts graphiques par chart.js -->
      <template v-if="!isHome">

        <!-- 1ére section les histogtammes des soutenance ,encadrants et etudiants dans chaque spécialité -->
        <div class="section-label">Répartition par spécialité</div>
        <div class="chart-row three-cols">
          <!--histo 1-->
          <div class="chart-card">
            <div class="chart-header"><div class="chart-title">Soutenances par spécialité</div><div class="chart-badge">Histogramme</div></div>
            <div class="chart-area"><canvas ref="soutSpecCanvas"></canvas></div>
          </div>
          <!--histo 2-->
          <div class="chart-card">
            <div class="chart-header"><div class="chart-title">Encadrants par spécialité</div><div class="chart-badge">Histogramme</div></div>
            <div class="chart-area"><canvas ref="encSpecCanvas"></canvas></div>
          </div>
          <!--histo3-->
          <div class="chart-card">
            <div class="chart-header"><div class="chart-title">Étudiants par spécialité</div><div class="chart-badge chart-badge-purple">Histogramme</div></div>
            <div class="chart-area"><canvas ref="etuSpecCanvas"></canvas></div>
          </div>
        </div>

      <!-- 2eme section  jouge, camembert,courbe-->
        <div class="section-label">Performance et réalisation</div>
        <div class="chart-row">
          <!--cart jauge : taux de reu-->
          <div class="chart-card">
            <!--entete-->
            <div class="chart-header"><div class="chart-title">Taux global de réussite PFE</div><div class="chart-badge chart-badge-green">Jauge</div></div>
            <div class="gauge-wrap"><!--conteneur de jauge-->
              <!--canvas de jauge-->
              <canvas ref="reussiteGaugeCanvas" height="180"></canvas>
              <div class="gauge-center"><div class="gauge-pct">{{ kpi.tauxReussite }}%</div><div class="gauge-lbl">Admis</div></div><!--centre de jauge-->
            </div>
            <!--details-->
            <div class="planif-details">
              <span class="pd-item"><span class="dot dot-green"></span>{{ charts.reussite?.admis || 0 }} admis</span>
              <span class="pd-item"><span class="dot dot-red"></span>{{ charts.reussite?.ajournes || 0 }} ajournés</span>
            </div>
          </div>
          <!--carte camembert sout réalisés et pas encore-->
          <div class="chart-card">
            <div class="chart-header"><div class="chart-title">Soutenances réalisées</div><div class="chart-badge chart-badge-blue">Camembert</div></div>
            <div class="chart-area"><canvas ref="soutRealisCanvas"></canvas></div>
            <!--pied-->
            <div class="chart-footer">{{ charts.soutRealis?.taux || 0 }}% de soutenances réalisées</div>
          </div>
          <!--courbe évolution des pfe par mois-->
          <div class="chart-card chart-wide">
            <div class="chart-header"><div class="chart-title">PFE finalisés dans les délais — évolution mensuelle</div><div class="chart-badge chart-badge-blue">Courbe</div></div>
            <div class="chart-area"><canvas ref="delaisCanvas"></canvas></div>
          </div>
        </div>

      </template>

    </template>
  </div>
</template>

<script>
import { ref } from 'vue'//pour creer une variable reactive (utilisé dans downloading et loading)
import api from '@/services/api.js'//notre instance pers d'axios
import {//composants necessaire de chart.js , chart la classe principal
  Chart, BarController, LineController, DoughnutController,//type ses graphique
  BarElement, LineElement, PointElement, ArcElement,//evenement visuelle
  CategoryScale, LinearScale, Tooltip, Legend, Filler//les echelles et les légendes
} from 'chart.js'

Chart.register(//obliga dans v3 enreg pour chart js comprend
  BarController, LineController, DoughnutController,
  BarElement, LineElement, PointElement, ArcElement,
  CategoryScale, LinearScale, Tooltip, Legend, Filler
)
//colors palette pour les histogrammes(hexadicimale)
const COLORS = ['#3d6080','#27ae60','#f5a623','#8e44ad','#e74c3c','#2980b9','#d35400','#16a085']
//chart js ne comprend que les couleurs rgba 
function hex(h, a) { const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16); return `rgba(${r},${g},${b},${a})` }

export default {
  name: 'DashboardDirecteurHome',
  props: {//props recu du parend dashboard directeur . vue
    currentUser:      { type: Object, default: () => ({}) },
    grillesEnAttente: { type: Number, default: 0 },
    // 'home'      → KPIs + raccourcis (sans graphiques)
    // 'dashboard' → graphiques & analyses complètes
    pageMode:         { type: String, default: 'dashboard' },
  },
  emits: ['navigate'],//evenenment pour changer les pages 

  setup() {
    const downloading = ref(false)
    const loading     = ref(true)
    return { downloading, loading }
  },

  computed: {
    isHome() { return this.pageMode === 'home' },//prop cal pour affiché la page
  },

  data() {
    return {
     //initialisation
      heureActualisation: '--:--',//valeur par defaut
      kpi:    { totalSpecialites: 0, totalEtudiants: 0, totalEncadrants: 0, totalSoutenances: 0, soutenancesTerminees: 0, tauxReussite: 0 },
      charts: {},
      instances: {},//pour stocke les instances de charte js 
    }
  },

  async mounted() { await this.charger() },//execute charger lors de l'insertion dans le dom
  beforeUnmount() { Object.values(this.instances).forEach(c => c?.destroy()) },//on detruit les graphique pour les rechargement et eviter le stockage dans la memoire

  methods: {
    async telechargerPDF() {
      this.downloading = true//disactive le boutton et change le texte du boutton
      try {
        const res = await api.get('/dashboard/directeur/export-pdf', { responseType: 'blob' })//on utilise blob pour eviter que le backend renvoi une reponse json, reponse pdf binaire
        const url  = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))//creer un url pour le document dans le memoire
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `tableau-de-bord-${new Date().toISOString().slice(0,10)}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)//libére le mémoire 
      } catch (e) {
        console.error('Export PDF échoué', e)
      } finally {
        this.downloading = false
      }
    },

    async charger() {
      Object.values(this.instances).forEach(c => c?.destroy())
      this.instances = {}
      this.loading = true
      try {
        const res = await api.get('/dashboard/directeur')
        this.kpi = res.data.kpi
        this.charts = {
          soutSpec:   res.data.charts.soutenancesParSpecialite,
          encSpec:    res.data.charts.encadrantsParSpecialite,
          etuSpec:    res.data.charts.etudiantsParSpecialite,
          reussite:   res.data.charts.tauxReussiteGlobal,
          soutRealis: res.data.charts.soutenancesRealisees,
          delais:     res.data.charts.pfeFinalisesDelais,
        }
        this.heureActualisation = new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})
      } catch(e) {
        console.error(e)
        this.kpi = { totalSpecialites: 5, totalEtudiants: 220, totalEncadrants: 32, totalSoutenances: 198, soutenancesTerminees: 142, tauxReussite: 84 }
        this.charts = {
          soutSpec:   { labels: ['GL','IA','RT','SIQ','SI'], values: [58,42,38,36,24] },
          encSpec:    { labels: ['GL','IA','RT','SIQ','SI'], values: [9,7,6,6,4] },
          etuSpec:    { labels: ['GL','IA','RT','SIQ','SI'], values: [60,44,40,38,38] },
          reussite:   { taux: 84, admis: 119, ajournes: 23, labels: ['Admis','Ajourné'], values: [119,23] },
          soutRealis: { taux: 72, labels: ['Réalisées','Planifiées','En attente'], values: [142,36,20] },
          delais:     { labels: ['Oct','Nov','Déc','Jan','Fév','Mar'], prevus: [30,35,28,38,40,27], realises: [28,30,22,32,34,20] },
        }
      } finally {
        this.loading = false
        if (!this.isHome) {
          this.$nextTick(() => this.$nextTick(() => this.buildCharts()))
        }
      }
    },

    buildCharts() {
      this.buildBarSpec('soutSpecCanvas','soutSpec','Soutenances')
      this.buildBarSpec('encSpecCanvas','encSpec','Encadrants')
      this.buildBarSpec('etuSpecCanvas','etuSpec','Étudiants')
      this.buildGauge()
      this.buildPie()
      this.buildLine()
    },

    destroyChart(key) { this.instances[key]?.destroy(); delete this.instances[key] },

    buildBarSpec(ref, key, label) {
      this.destroyChart(key)
      const ctx = this.$refs[ref]
      if (!ctx || !this.charts[key]?.labels?.length) return
      this.instances[key] = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.charts[key].labels,
          datasets: [{ label, data: this.charts[key].values, backgroundColor: COLORS.map(c=>hex(c,0.72)), borderRadius: 6, borderSkipped: false }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1, color: '#8a9aaa' }, grid: { color: 'rgba(200,196,188,0.1)' } },
            x: { ticks: { color: '#8a9aaa' }, grid: { display: false } },
          },
        },
      })
    },

    buildGauge() {
      this.destroyChart('gauge')
      const ctx = this.$refs.reussiteGaugeCanvas
      if (!ctx) return
      this.instances.gauge = new Chart(ctx, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [this.kpi.tauxReussite, 100 - this.kpi.tauxReussite],
            backgroundColor: [hex('#27ae60',0.85), hex('#7f8c8d',0.2)],
            borderColor: ['#27ae60', 'transparent'],
            borderWidth: 2,
            circumference: 270,
            rotation: -135,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          cutout: '72%',
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.raw}%` } } },
        },
      })
    },

    buildPie() {
      this.destroyChart('pie')
      const ctx = this.$refs.soutRealisCanvas
      if (!ctx || !this.charts.soutRealis) return
      this.instances.pie = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: this.charts.soutRealis.labels,
          datasets: [{
            data: this.charts.soutRealis.values,
            backgroundColor: [hex('#27ae60',0.8), hex('#f5a623',0.8), hex('#7f8c8d',0.5)],
            borderColor: ['#27ae60','#f5a623','#c8c4bc'],
            borderWidth: 2,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#8a9aaa', boxWidth: 12, padding: 16 } },
            tooltip: { callbacks: { label: c => ` ${c.raw} soutenances` } },
          },
        },
      })
    },

    buildLine() {
      this.destroyChart('line')
      const ctx = this.$refs.delaisCanvas
      if (!ctx || !this.charts.delais?.labels?.length) return
      this.instances.line = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.charts.delais.labels,
          datasets: [
            { label: 'Prévus',   data: this.charts.delais.prevus,   borderColor: '#3d6080', backgroundColor: hex('#3d6080',0.08), tension: 0.4, fill: true, pointRadius: 4 },
            { label: 'Réalisés', data: this.charts.delais.realises, borderColor: '#27ae60', backgroundColor: hex('#27ae60',0.08), tension: 0.4, fill: true, pointRadius: 4 },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#8a9aaa', boxWidth: 12 } } },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 5, color: '#8a9aaa' }, grid: { color: 'rgba(200,196,188,0.1)' } },
            x: { ticks: { color: '#8a9aaa' }, grid: { display: false } },
          },
        },
      })
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Source+Sans+3:wght@300;400;500;600&display=swap');
.home-wrap { padding: 0; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
.page-title { font-family: 'Merriweather', serif; font-size: 22px; font-weight: 700; color: #1e2a35; margin-bottom: 4px; }
.page-sub { font-size: 13.5px; color: #7A8FA6; }
.header-meta { display: flex; align-items: center; gap: 10px; }
.last-refresh { font-size: 12px; color: #aaa; }
.btn-refresh { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #e8e4dc; border: 1.5px solid #c8c4bc; border-radius: 9px; font-size: 13px; font-weight: 600; color: #4a5a6a; cursor: pointer; font-family: 'Source Sans 3', sans-serif; transition: all .18s; }
.btn-refresh:hover:not(:disabled) { border-color: #3d6080; color: #3d6080; }
.btn-download { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #3d6080; color: #fff; border: 1.5px solid #3d6080; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Source Sans 3', sans-serif; transition: all .18s; }
.btn-download:hover:not(:disabled) { background: #2f4f6a; }
.btn-download:disabled, .btn-refresh:disabled { opacity: .5; cursor: not-allowed; }
.spinning { animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.section-label { font-size: 11px; font-weight: 700; color: #8a9aaa; text-transform: uppercase; letter-spacing: .1em; margin: 24px 0 12px; }
/* Alert */
.alert-warning { display: flex; align-items: center; gap: 14px; padding: 16px 20px; background: #fff9e6; border: 1.5px solid #f5a623; border-radius: 12px; margin-bottom: 20px; color: #7d5a00; }
.aw-body { flex: 1; } .aw-title { font-weight: 700; font-size: 14px; margin-bottom: 2px; } .aw-sub { font-size: 12.5px; opacity: .8; }
.btn-warning { padding: 8px 18px; background: #f5a623; color: #fff; border: none; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; font-family: 'Source Sans 3', sans-serif; }
/* KPI */
.kpi-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; margin-bottom: 8px; }
.kpi-card { background: #ddd9d1; border: 1.5px solid #c8c4bc; border-radius: 14px; padding: 18px 16px; display: flex; align-items: center; gap: 13px; box-shadow: 0 2px 10px rgba(0,0,0,.05); }
.kpi-icon-wrap { width: 42px; height: 42px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kpi-blue .kpi-icon-wrap   { background: rgba(61,96,128,.12); color: #3d6080; }
.kpi-slate .kpi-icon-wrap  { background: rgba(127,140,141,.12); color: #7f8c8d; }
.kpi-teal .kpi-icon-wrap   { background: rgba(39,174,96,.12); color: #27ae60; }
.kpi-gold .kpi-icon-wrap   { background: rgba(245,166,35,.12); color: #d98e1a; }
.kpi-green .kpi-icon-wrap  { background: rgba(39,174,96,.12); color: #27ae60; }
.kpi-red .kpi-icon-wrap    { background: rgba(231,76,60,.12); color: #e74c3c; }
.kpi-value { font-family: 'Merriweather', serif; font-size: 22px; font-weight: 700; color: #1e2a35; line-height: 1; }
.kpi-label { font-size: 11.5px; color: #8a9aaa; margin-top: 3px; }
/* Charts */
.chart-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; margin-bottom: 8px; }
.chart-row:not(.three-cols) { grid-template-columns: 1fr 1fr 2fr; }
.chart-card { background: #ddd9d1; border: 1.5px solid #c8c4bc; border-radius: 16px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,.05); }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.chart-title { font-size: 13px; font-weight: 700; color: #1e2a35; }
.chart-badge { font-size: 10.5px; font-weight: 700; padding: 3px 9px; border-radius: 20px; background: rgba(61,96,128,.12); color: #3d6080; }
.chart-badge-green  { background: rgba(39,174,96,.12); color: #27ae60; }
.chart-badge-blue   { background: rgba(61,96,128,.12); color: #3d6080; }
.chart-badge-purple { background: rgba(142,68,173,.12); color: #8e44ad; }
.chart-area { height: 200px; position: relative; }
.chart-footer { margin-top: 10px; font-size: 12.5px; color: #7A8FA6; text-align: center; }
/* Gauge */
.gauge-wrap { position: relative; height: 180px; display: flex; align-items: center; justify-content: center; }
.gauge-center { position: absolute; text-align: center; top: 52%; transform: translateY(-50%); }
.gauge-pct { font-family: 'Merriweather', serif; font-size: 26px; font-weight: 700; color: #1e2a35; }
.gauge-lbl { font-size: 12px; color: #8a9aaa; margin-top: 2px; }
.planif-details { display: flex; justify-content: center; gap: 20px; margin-top: 8px; }
.pd-item { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #7A8FA6; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot-green { background: #27ae60; } .dot-red { background: #e74c3c; }
/* Quick actions */
.qa-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
.qa-card { display: flex; align-items: center; gap: 12px; background: #ddd9d1; border: 1.5px solid #c8c4bc; border-radius: 14px; padding: 16px; cursor: pointer; text-align: left; transition: all .2s; }
.qa-card:hover { border-color: #3d6080; transform: translateY(-2px); box-shadow: 0 4px 16px rgba(61,96,128,.12); }
.qa-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.qa-blue  { background: rgba(61,96,128,.12);  color: #3d6080; }
.qa-gold  { background: rgba(245,166,35,.12); color: #d98e1a; }
.qa-teal  { background: rgba(39,174,96,.12);  color: #27ae60; }
.qa-slate { background: rgba(127,140,141,.12);color: #7f8c8d; }
.qa-red   { background: rgba(231,76,60,.12);  color: #e74c3c; }
.qa-txt { flex: 1; } .qa-t { font-size: 13px; font-weight: 600; color: #1e2a35; margin-bottom: 2px; } .qa-s { font-size: 12px; color: #8a9aaa; }
.qa-arr { color: #c8c4bc; flex-shrink: 0; transition: transform .18s, color .18s; }
.qa-card:hover .qa-arr { transform: translateX(3px); color: #3d6080; }
/* Loading */
.loading-state { text-align: center; padding: 60px; color: #7A8FA6; }
.spinner { width: 32px; height: 32px; border: 3px solid #c8c4bc; border-top-color: #3d6080; border-radius: 50%; animation: spin .8s linear infinite; margin: 0 auto 12px; }
@media(max-width:1300px) { .kpi-row { grid-template-columns: repeat(3,1fr); } .chart-row,.chart-row:not(.three-cols) { grid-template-columns: 1fr; } .qa-grid { grid-template-columns: repeat(2,1fr); } }
</style>