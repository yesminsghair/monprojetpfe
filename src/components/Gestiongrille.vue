<template>
<div class="page-content">
  <div class="page-header">
    <div>
      <h2>Grille d'évaluation</h2>
      <p class="subtitle">Définissez les catégories et critères — total automatiquement calculé sur 20 points</p>
    </div>
    <div class="header-right">
      <div class="total-pill" :class="totalOk ? 'tp-ok' : 'tp-warn'">
        <svg v-if="totalOk" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <strong>{{ totalNotes }}</strong> / 20 pts
      </div>
      <!-- Only show add-category button when grid is still editable -->
      <button v-if="!publie && !verrouille" class="btn-blue" @click="openCat">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Catégorie
      </button>
      <!-- Publier button: only when editable and total ok -->
      <button v-if="!publie && !verrouille" class="btn-outline" @click="publier" :disabled="!totalOk">
        Soumettre au directeur
      </button>
      <!-- Verrouiller button: chef can lock the grille themselves (brouillon or publie but NOT yet verrouille) -->
      <button v-if="!verrouille && totalOk" class="btn-lock" @click="verrouillerGrille" :disabled="locking">
        <span v-if="locking" class="btn-spinner"></span>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        {{ publie ? 'Verrouiller (validée ✓)' : 'Verrouiller directement' }}
      </button>
    </div>
  </div>

  <transition name="toast"><div v-if="toast.show" class="toast" :class="'toast-'+toast.type">{{ toast.msg }}<button @click="toast.show=false" class="toast-x"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div></transition>

  <!-- CONTEXTUAL STATUS MESSAGE (replaces old status bar pills) -->
  <div v-if="verrouille" class="status-msg status-msg-locked">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    <div>
      <div class="sm-title">Grille publiée et validée par le directeur</div>
      <div class="sm-sub">Cette grille est officielle — les modifications ne sont plus autorisées.</div>
    </div>
  </div>
  <div v-else-if="publie && !valideeParDirecteur" class="status-msg status-msg-pending">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    <div>
      <div class="sm-title">La grille est en attente de validation du directeur</div>
      <div class="sm-sub">Vous ne pouvez plus modifier les catégories ni les critères. Vous pouvez aussi la verrouiller directement via le bouton en haut à droite.</div>
    </div>
  </div>
  <div v-else-if="publie && valideeParDirecteur" class="status-msg status-msg-validated">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
    <div>
      <div class="sm-title">✅ Grille validée par le directeur — prête à verrouiller</div>
      <div class="sm-sub">Le directeur a approuvé votre grille. Cliquez sur <strong>Verrouiller (validée ✓)</strong> pour la publier officiellement aux encadrants et jurys.</div>
    </div>
  </div>
  <div v-else class="status-msg status-msg-draft">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
    <div>
      <div class="sm-title">Grille en cours de rédaction</div>
      <div class="sm-sub">
        Ajoutez vos catégories et critères, puis soumettez au directeur quand le total atteint 20 pts.
        <span v-if="!totalOk" class="sm-warn"> ({{ 20 - totalNotes }} pt(s) manquant(s))</span>
      </div>
    </div>
  </div>

  <!-- VISIBILITY ROW — only encadrants, jurys, directeur (no students, no other chefs) -->
  <div class="vis-row" v-if="!publie && !verrouille">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
    <span class="vis-label">Visible par :</span>
    <select v-model="visibilite" class="vis-sel">
      <option value="directeur">Directeur uniquement</option>
      <option value="encadrants">Directeur + Encadrants</option>
      <option value="jurys">Directeur + Encadrants + Jurys</option>
    </select>
  </div>

  <div class="empty-state" v-if="!categories.length">
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
    <p>Aucune catégorie définie</p>
    <button v-if="!publie && !verrouille" class="btn-blue" @click="openCat">Créer la première catégorie</button>
  </div>

  <div v-for="cat in categories" :key="cat.id" class="cat-block" :style="{'--accent': cat.color}">
    <div class="cat-hdr">
      <div class="cat-left">
        <div class="cat-accent" :style="{background: cat.color}"></div>
        <div>
          <div class="cat-nom">{{ cat.nom }}</div>
          <div class="cat-meta">{{ cat.criteres.length }} critère(s) · {{ catSum(cat) }} pts / {{ cat.max }}</div>
        </div>
      </div>
      <div class="cat-right">
        <span class="cat-pts" :style="{color:cat.color}">{{ cat.max }} pts max</span>
        <button class="btn-sm-add" @click="openCr(cat)" :disabled="verrouille||publie">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Critère
        </button>
        <button class="icon-btn" @click="editCat(cat)" :disabled="verrouille||publie">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="icon-btn icon-del" @click="delCat(cat.id)" :disabled="verrouille||publie">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>
      </div>
    </div>

    <div class="crit-list" v-if="cat.criteres.length">
      <div v-for="(cr,i) in cat.criteres" :key="cr.id" class="crit-row">
        <span class="cr-i">{{ i+1 }}</span>
        <span class="cr-nom">{{ cr.nom }}</span>
        <div class="cr-bar"><div class="cr-fill" :style="{width:(cat.max?cr.note/cat.max*100:0)+'%', background:cat.color}"></div></div>
        <span class="cr-pts" :style="{color:cat.color}">{{ cr.note }}pt</span>
        <div class="cr-btns" v-if="!verrouille && !publie">
          <button class="icon-btn" @click="editCr(cat,cr)"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
          <button class="icon-btn icon-del" @click="delCr(cat, cr.id)"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>
        </div>
      </div>
    </div>
    <div class="crit-vide" v-else>Aucun critère — cliquez sur Critère pour en ajouter</div>
  </div>

  <div class="recap" v-if="categories.length">
    <div class="recap-title">Récapitulatif</div>
    <div class="recap-body">
      <div class="rr-head"><span>Catégorie</span><span>Critères</span><span>Max</span></div>
      <div v-for="c in categories" :key="c.id" class="rr-row">
        <span :style="{color:c.color,fontWeight:700}">{{ c.nom }}</span>
        <span class="rr-crit">{{ c.criteres.map(x=>x.nom).join(', ')||'—' }}</span>
        <span :style="{color:c.color,fontWeight:700}">{{ c.max }}</span>
      </div>
      <div class="rr-total">
        <span>TOTAL</span><span></span>
        <span :class="totalOk?'rt-ok':'rt-warn'">{{ totalNotes }} / 20</span>
      </div>
    </div>
  </div>

  <!-- MODAL CAT -->
  <transition name="modal-fade">
    <div v-if="showCatM" class="modal-ov" @click.self="showCatM=false">
      <div class="modal">
        <div class="modal-hdr"><h3>{{ editingCat?'Modifier':'Nouvelle' }} catégorie</h3><button class="mclose" @click="showCatM=false"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
        <div class="modal-body">
          <div class="fg"><label>Nom *</label><input v-model="catF.nom" placeholder="Ex: Analyse et spécification"/></div>
          <div class="form-row">
            <div class="fg">
              <label>Couleur</label>
              <div class="colors">
                <button
                  v-for="c in colors"
                  :key="c.value"
                  class="cbtn"
                  :class="{cact: catF.color === c.value}"
                  :style="{background: c.value}"
                  :title="c.label"
                  type="button"
                  @click.prevent="catF.color = c.value">
                  <svg v-if="catF.color === c.value" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                </button>
              </div>
              <!-- Color preview -->
              <div class="color-preview">
                <span class="cp-dot" :style="{background: catF.color}"></span>
                <span class="cp-label">{{ colorLabel(catF.color) }}</span>
              </div>
            </div>
            <div class="fg"><label>Note max (pts)</label><input type="number" v-model.number="catF.max" min="1" max="20"/>
              <p class="fg-hint">Disponible : {{ 20-totalSansCat }} pts</p>
            </div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn-cancel" @click="showCatM=false">Annuler</button>
          <button class="btn-gold" @click="saveCat" :disabled="savingCat">
            <span v-if="savingCat" class="btn-spinner"></span>
            {{ editingCat?'Enregistrer':'Créer la catégorie' }}
          </button>
        </div>
      </div>
    </div>
  </transition>

  <!-- MODAL CR -->
  <transition name="modal-fade">
    <div v-if="showCrM" class="modal-ov" @click.self="showCrM=false">
      <div class="modal">
        <div class="modal-hdr"><h3>{{ editingCr?'Modifier':'Nouveau' }} critère</h3>
          <span v-if="currentCat" class="ctag" :style="{color:currentCat.color,border:'1.5px solid '+currentCat.color+'44',background:currentCat.color+'11'}">{{ currentCat.nom }}</span>
          <button class="mclose" @click="showCrM=false"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div class="modal-body">
          <div class="fg"><label>Nom *</label><input v-model="crF.nom" placeholder="Ex: Problématique"/></div>
          <div class="fg"><label>Note max (pts)</label><input type="number" v-model.number="crF.note" min="0.5" step="0.5"/></div>
        </div>
        <div class="modal-foot"><button class="btn-cancel" @click="showCrM=false">Annuler</button><button class="btn-gold" @click="saveCr">{{ editingCr?'Enregistrer':'Ajouter' }}</button></div>
      </div>
    </div>
  </transition>
</div>
</template>

<script>
import api from '@/services/api.js'

// Fixed, named colors — each with a value and a display label
const COLORS = [
  { value: '#3d6080', label: 'Bleu acier' },
  { value: '#27ae60', label: 'Vert' },
  { value: '#e74c3c', label: 'Rouge' },
  { value: '#f5a623', label: 'Orange' },
  { value: '#8e44ad', label: 'Violet' },
  { value: '#2980b9', label: 'Bleu vif' },
  { value: '#d35400', label: 'Brun orangé' },
  { value: '#16a085', label: 'Teal' },
  { value: '#c0392b', label: 'Cramoisi' },
  { value: '#2c3e50', label: 'Ardoise' },
]

export default {
  name: 'GestionGrille',
  data() {
    return {
      publie: false,
      verrouille: false,
      visibilite: 'directeur',
      showCatM: false,
      showCrM: false,
      editingCat: null,
      editingCr: null,
      currentCat: null,
      savingCat: false,
      toast: { show: false, msg: '', type: 'ok' },
      colors: COLORS,
      catF: { nom: '', color: COLORS[0].value, max: 2 },
      crF: { nom: '', note: 1 },
      categories: [],
      loading: false,
      grilleId: null,
      locking: false,
      valideeParDirecteur: false,   // true when statut was 'publie' and directeur locked it
      // Map: category id → assigned color value (stable across reloads)
      catColorMap: {}
    }
  },
  computed: {
    totalNotes() {
      return this.categories.reduce((s, c) => s + c.max, 0)
    },
    totalOk() {
      return this.totalNotes === 20
    },
    totalSansCat() {
      if (!this.editingCat) return this.totalNotes
      return this.categories.filter(c => c.id !== this.editingCat.id).reduce((s, c) => s + c.max, 0)
    }
  },
  mounted() {
    this.chargerGrille()
  },
  methods: {

    async chargerGrille() {
      this.loading = true
      try {
        const res = await api.get('/grilles')
        if (res.data.length > 0) {
          const grille = res.data[0]
          this.grilleId = grille.id
          this.publie = grille.statut === 'publie'
          this.verrouille = grille.statut === 'verrouille'
          this.visibilite = grille.visibilite || 'directeur'
          // valideeParDirecteur: grille was submitted (publie_le set) AND is now publie
          // meaning directeur validated it but chef hasn't verrouilled yet
          this.valideeParDirecteur = grille.statut === 'publie' && !!grille.verrouille_le
          this.categories = grille.categories.map(cat => {
            // Assign a stable color per category id
            if (!this.catColorMap[cat.id]) {
              const usedCount = Object.keys(this.catColorMap).length
              this.catColorMap[cat.id] = COLORS[usedCount % COLORS.length].value
            }
            const color = cat.color || this.catColorMap[cat.id]
            return {
              id: cat.id,
              nom: cat.nom,
              color,
              max: parseFloat(cat.bareme_max),
              criteres: cat.criteres.map(cr => ({
                id: cr.id,
                nom: cr.nom,
                note: parseFloat(cr.bareme_max)
              }))
            }
          })
        } else {
          const created = await api.post('/grilles', { nom: 'Grille PFE' })
          this.grilleId = created.data.id
          this.publie = false
          this.verrouille = false
          this.categories = []
        }
      } catch (error) {
        this.showToast('Erreur de chargement', 'err')
      } finally {
        this.loading = false
      }
    },

    colorLabel(value) {
      return COLORS.find(c => c.value === value)?.label || value
    },

    catSum(c) {
      return c.criteres.reduce((s, x) => s + x.note, 0)
    },

    showToast(msg, type = 'ok') {
      this.toast = { show: true, msg, type }
      setTimeout(() => (this.toast.show = false), 3000)
    },

    async openCat() {
      if (this.verrouille || this.publie) {
        this.showToast('Grille non modifiable', 'err')
        return
      }
      this.editingCat = null
      // Default to next unused color
      const usedColors = this.categories.map(c => c.color)
      const nextColor = COLORS.find(c => !usedColors.includes(c.value))?.value || COLORS[0].value
      this.catF = { nom: '', color: nextColor, max: 2 }
      this.showCatM = true
    },

    async editCat(c) {
      if (this.verrouille || this.publie) {
        this.showToast('Grille non modifiable', 'err')
        return
      }
      this.editingCat = c
      this.catF = { nom: c.nom, color: c.color, max: c.max }
      this.showCatM = true
    },

    async saveCat() {
      if (!this.catF.nom.trim()) {
        this.showToast('Nom requis', 'err')
        return
      }
      this.savingCat = true
      try {
        if (this.editingCat) {
          await api.put(`/grilles/${this.grilleId}/categories/${this.editingCat.id}`, {
            nom: this.catF.nom,
            bareme_max: this.catF.max,
            color: this.catF.color
          })
          // Update locally for instant feedback
          const idx = this.categories.findIndex(c => c.id === this.editingCat.id)
          if (idx !== -1) {
            this.categories[idx].nom = this.catF.nom
            this.categories[idx].max = this.catF.max
            this.categories[idx].color = this.catF.color
          }
          this.showToast('Catégorie modifiée ✓')
          this.showCatM = false
        } else {
          // Create: close modal immediately, show success, then reload
          const res = await api.post(`/grilles/${this.grilleId}/categories`, {
            nom: this.catF.nom,
            bareme_max: this.catF.max,
            color: this.catF.color
          })
          // Assign color in map for the new id
          this.catColorMap[res.data.id] = this.catF.color
          this.showCatM = false
          this.showToast('Catégorie créée avec succès ✓')
          // Reload in background
          await this.chargerGrille()
        }
      } catch {
        this.showToast('Erreur', 'err')
      } finally {
        this.savingCat = false
      }
    },

    async delCat(id) {
      if (this.verrouille || this.publie) {
        this.showToast('Grille non modifiable', 'err')
        return
      }
      if (!confirm('Supprimer cette catégorie et tous ses critères ?')) return
      try {
        await api.delete(`/grilles/${this.grilleId}/categories/${id}`)
        this.categories = this.categories.filter(c => c.id !== id)
        this.showToast('Supprimée')
      } catch {
        this.showToast('Erreur', 'err')
      }
    },

    openCr(cat) {
      if (this.verrouille || this.publie) {
        this.showToast('Grille non modifiable', 'err')
        return
      }
      this.currentCat = cat
      this.editingCr = null
      this.crF = { nom: '', note: 0.5 }
      this.showCrM = true
    },

    editCr(cat, cr) {
      if (this.verrouille || this.publie) {
        this.showToast('Grille non modifiable', 'err')
        return
      }
      this.currentCat = cat
      this.editingCr = cr
      this.crF = { nom: cr.nom, note: cr.note }
      this.showCrM = true
    },

    async delCr(cat, crId) {
      if (!confirm('Supprimer ce critère ?')) return
      try {
        await api.delete(`/criteres/${crId}`)
        cat.criteres = cat.criteres.filter(c => c.id !== crId)
        this.showToast('Critère supprimé')
      } catch {
        this.showToast('Erreur', 'err')
      }
    },

    async saveCr() {
      if (!this.crF.nom.trim()) {
        this.showToast('Nom requis', 'err')
        return
      }
      try {
        if (this.editingCr) {
          await api.put(`/criteres/${this.editingCr.id}`, {
            nom: this.crF.nom,
            bareme_max: this.crF.note
          })
          this.editingCr.nom = this.crF.nom
          this.editingCr.note = this.crF.note
          this.showToast('Critère modifié ✓')
        } else {
          await api.post(`/grilles/${this.grilleId}/categories/${this.currentCat.id}/criteres`, {
            nom: this.crF.nom,
            bareme_max: this.crF.note
          })
          await this.chargerGrille()
          this.showToast('Critère ajouté ✓')
        }
        this.showCrM = false
      } catch {
        this.showToast('Erreur', 'err')
      }
    },

    async publier() {
      if (!this.totalOk) {
        this.showToast('Le total doit être exactement 20 pts pour soumettre', 'err')
        return
      }
      if (!confirm('Soumettre la grille au directeur pour validation ? Vous ne pourrez plus la modifier.')) return
      try {
        await api.put(`/grilles/${this.grilleId}`, { nom: 'Grille PFE', visibilite: this.visibilite })
        await api.post(`/grilles/${this.grilleId}/publier`)
        this.publie = true
        this.showToast('Grille soumise — en attente de validation par le directeur ✓')
      } catch {
        this.showToast('Erreur', 'err')
      }
    },

    async verrouillerGrille() {
      const msg = this.valideeParDirecteur
        ? 'Verrouiller la grille et la publier aux encadrants et jurys ?'
        : 'Verrouiller la grille directement sans passer par le directeur ? Les encadrants et jurys seront notifiés.'
      if (!confirm(msg)) return
      this.locking = true
      try {
        await api.post(`/grilles/${this.grilleId}/verrouiller`)
        this.verrouille = true
        this.publie = false
        this.showToast('Grille verrouillée et publiée — encadrants et jurys notifiés ✓')
      } catch (e) {
        this.showToast(e.response?.data?.message || 'Erreur lors du verrouillage', 'err')
      } finally {
        this.locking = false
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
.page-content{font-family:'Source Sans 3',sans-serif;color:#1e2a35}
.page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;gap:16px;flex-wrap:wrap}
h2{font-family:'Merriweather',serif;font-size:1.4rem;font-weight:700;color:#1e2a35;margin-bottom:4px}
.subtitle{font-size:0.88rem;color:#8a9aaa;font-weight:300}
.header-right{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.total-pill{display:flex;align-items:center;gap:6px;padding:7px 16px;border-radius:20px;font-size:0.85rem;font-weight:600;border:1.5px solid}
.tp-ok{background:#d4edda;color:#155724;border-color:#c3e6cb}
.tp-warn{background:#fff3cd;color:#856404;border-color:#ffc107}
.total-pill strong{font-family:'Merriweather',serif;font-size:1.1rem}

/* STATUS MESSAGE */
.status-msg{display:flex;align-items:flex-start;gap:12px;border-radius:12px;padding:14px 18px;margin-bottom:18px;border:1.5px solid}
.status-msg-draft{background:#eef6fd;border-color:rgba(61,96,128,0.3);color:#2c4f72}
.status-msg-pending{background:#fff9e8;border-color:#f5a623;color:#7a4f00}
.status-msg-locked{background:#d4edda;border-color:rgba(39,174,96,0.4);color:#155724}
.status-msg-validated{background:linear-gradient(135deg,rgba(39,174,96,0.08),rgba(245,197,24,0.06));border-color:rgba(39,174,96,0.5);color:#155724}
.sm-title{font-weight:700;font-size:13.5px;margin-bottom:2px}
.sm-sub{font-size:12.5px;opacity:.85;line-height:1.4}
.sm-warn{color:#c0392b;font-weight:600}

/* VISIBILITY ROW */
.vis-row{display:flex;align-items:center;gap:8px;background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:10px;padding:10px 16px;margin-bottom:16px;font-size:13px;color:#4a5a6a}
.vis-label{font-weight:600;white-space:nowrap}
.vis-sel{border:1.5px solid #c8c4bc;background:#ddd9d1;border-radius:8px;padding:5px 10px;font-size:13px;color:#1e2a35;font-family:'Source Sans 3',sans-serif;flex:1;max-width:280px}

.toast{display:flex;justify-content:space-between;align-items:center;padding:11px 16px;border-radius:10px;margin-bottom:16px;font-size:0.88rem;font-weight:500;border:1.5px solid}
.toast-ok{background:#e8f5e9;color:#155724;border-color:#c3e6cb}
.toast-err{background:#f8d7da;color:#721c24;border-color:#f5c6cb}
.toast-x{background:none;border:none;cursor:pointer;color:inherit;opacity:.6;display:flex;align-items:center}
.toast-enter-active,.toast-leave-active{transition:all .25s}
.toast-enter-from,.toast-leave-to{opacity:0;transform:translateY(-6px)}

.empty-state{background:#e8e4dc;border:2px dashed #c8c4bc;border-radius:14px;padding:52px 20px;text-align:center;color:#8a9aaa;display:flex;flex-direction:column;align-items:center;gap:12px;margin-bottom:16px}
.empty-state svg{opacity:.4}
.empty-state p{font-size:0.9rem;font-weight:300}

.cat-block{background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:12px;overflow:hidden;margin-bottom:14px;box-shadow:0 2px 10px rgba(0,0,0,.05)}
.cat-hdr{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;background:#ddd9d1;border-bottom:1.5px solid #c8c4bc;flex-wrap:wrap;gap:10px;border-left:4px solid var(--accent)}
.cat-left{display:flex;align-items:center;gap:12px}
.cat-accent{width:14px;height:14px;border-radius:4px;flex-shrink:0}
.cat-nom{font-family:'Merriweather',serif;font-size:0.92rem;font-weight:700;color:#1e2a35}
.cat-meta{font-size:0.78rem;color:#8a9aaa;font-weight:300;margin-top:2px}
.cat-right{display:flex;align-items:center;gap:8px}
.cat-pts{font-size:0.82rem;font-weight:700}
.crit-list{padding:0 16px}
.crit-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #c8c4bc}
.crit-row:last-child{border-bottom:none}
.cr-i{width:22px;height:22px;border-radius:6px;background:#ddd9d1;color:#8a9aaa;font-size:0.72rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.cr-nom{flex:1;font-size:0.88rem;color:#1e2a35;font-weight:500}
.cr-bar{flex:0 0 80px;height:6px;background:#c8c4bc;border-radius:10px;overflow:hidden}
.cr-fill{height:100%;border-radius:10px;transition:width .35s}
.cr-pts{font-size:0.82rem;font-weight:700;min-width:36px;text-align:right}
.cr-btns{display:flex;gap:4px}
.crit-vide{padding:14px 16px;font-size:0.82rem;color:#c8c4bc;font-weight:300;font-style:italic}

.recap{background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:12px;overflow:hidden;margin-top:8px}
.recap-title{padding:13px 18px;font-family:'Merriweather',serif;font-size:0.9rem;font-weight:700;color:#1e2a35;background:#ddd9d1;border-bottom:1.5px solid #c8c4bc}
.recap-body{padding:0 18px}
.rr-head{display:grid;grid-template-columns:170px 1fr 60px;gap:10px;padding:8px 0;border-bottom:1.5px solid #c8c4bc;font-size:0.72rem;font-weight:700;color:#8a9aaa;text-transform:uppercase;letter-spacing:.05em}
.rr-row{display:grid;grid-template-columns:170px 1fr 60px;gap:10px;padding:9px 0;border-bottom:1px solid #c8c4bc;align-items:center}
.rr-row:last-child{border-bottom:none}
.rr-crit{font-size:0.78rem;color:#8a9aaa;font-weight:300}
.rr-total{display:grid;grid-template-columns:170px 1fr 60px;gap:10px;border-top:2px solid #c8c4bc;background:#ddd9d1;margin:0 -18px;padding:12px 18px}
.rr-total>span:first-child{font-size:0.8rem;font-weight:700;color:#1e2a35;text-transform:uppercase;letter-spacing:.06em;align-self:center}
.rt-ok{font-family:'Merriweather',serif;font-size:1.1rem;font-weight:700;color:#27ae60;text-align:right}
.rt-warn{font-family:'Merriweather',serif;font-size:1.1rem;font-weight:700;color:#d98e1a;text-align:right}

/* BUTTONS */
.btn-gold{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;background:linear-gradient(160deg,#f5a623,#d98e1a);color:#1e2a35;border:none;border-radius:9px;font-size:0.88rem;font-weight:700;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:.2s;box-shadow:0 3px 10px rgba(245,166,35,.25)}
.btn-gold:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 5px 16px rgba(245,166,35,.35)}
.btn-gold:disabled{opacity:.5;cursor:not-allowed}
.btn-blue{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;background:linear-gradient(160deg,#4a7090,#3d6080);color:#fff;border:none;border-radius:9px;font-size:0.88rem;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:.2s;box-shadow:0 3px 10px rgba(61,96,128,.2)}
.btn-blue:hover{transform:translateY(-1px)}
.btn-outline{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;background:transparent;border:1.5px solid #c8c4bc;border-radius:9px;font-size:0.88rem;font-weight:600;cursor:pointer;color:#4a5a6a;font-family:'Source Sans 3',sans-serif;transition:.18s}
.btn-outline:hover:not(:disabled){border-color:#3d6080;color:#3d6080}
.btn-outline:disabled{opacity:.4;cursor:not-allowed}
.btn-lock{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;background:linear-gradient(160deg,#27ae60,#1e8449);color:#fff;border:none;border-radius:9px;font-size:0.88rem;font-weight:700;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:.2s;box-shadow:0 3px 10px rgba(39,174,96,.25)}
.btn-lock:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 5px 16px rgba(39,174,96,.35)}
.btn-lock:disabled{opacity:.5;cursor:not-allowed}
.btn-sm-add{display:inline-flex;align-items:center;gap:5px;padding:6px 12px;background:linear-gradient(160deg,#4a7090,#3d6080);color:#fff;border:none;border-radius:7px;font-size:0.78rem;font-weight:600;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:.15s}
.btn-sm-add:hover:not(:disabled){opacity:.88}
.btn-sm-add:disabled{opacity:.35;cursor:not-allowed}
.btn-cancel{padding:10px 18px;background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:9px;font-size:0.88rem;font-weight:600;cursor:pointer;color:#4a5a6a;font-family:'Source Sans 3',sans-serif}
.btn-cancel:hover{background:#c8c4bc}
.btn-spinner{width:14px;height:14px;border:2px solid rgba(0,0,0,0.2);border-top-color:#1e2a35;border-radius:50%;animation:spin .7s linear infinite;display:inline-block}
@keyframes spin{to{transform:rotate(360deg)}}
.icon-btn{width:28px;height:28px;border:1.5px solid #c8c4bc;background:#ddd9d1;border-radius:7px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#4a5a6a;transition:.15s;padding:0}
.icon-btn:hover:not(:disabled){background:#3d6080;color:#fff;border-color:#3d6080}
.icon-del:hover:not(:disabled){background:#e74c3c!important;border-color:#e74c3c!important;color:#fff!important}
.icon-btn:disabled{opacity:.3;cursor:not-allowed}

/* MODAL */
.modal-ov{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}
.modal{background:#ddd9d1;border-radius:16px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.25)}
.modal-hdr{display:flex;align-items:center;padding:20px 24px 0;gap:10px;flex-wrap:wrap}
.modal-hdr h3{font-family:'Merriweather',serif;font-size:1rem;color:#1e2a35;flex:1}
.ctag{font-size:0.75rem;font-weight:700;padding:3px 10px;border-radius:20px;border:1.5px solid;white-space:nowrap}
.mclose{background:none;border:none;cursor:pointer;color:#8a9aaa;display:flex;align-items:center;margin-left:auto;transition:color .15s}
.mclose:hover{color:#1e2a35}
.modal-body{padding:20px 24px;display:flex;flex-direction:column;gap:14px}
.modal-foot{padding:16px 24px;border-top:1px solid #c8c4bc;display:flex;justify-content:flex-end;gap:10px}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.fg{display:flex;flex-direction:column;gap:6px}
.fg label{font-size:0.85rem;font-weight:600;color:#2f4f6a}
.fg input{padding:10px 12px;border:1.5px solid #c8c4bc;border-radius:9px;background:#e8e4dc;font-size:0.9rem;color:#1e2a35;font-family:'Source Sans 3',sans-serif;transition:.18s}
.fg input:focus{outline:none;border-color:#f5a623;background:#fff}
.fg-hint{font-size:0.75rem;color:#8a9aaa;margin-top:2px}

/* COLOR PICKER - fixed */
.colors{display:flex;flex-wrap:wrap;gap:7px;margin-top:2px}
.cbtn{width:28px;height:28px;border-radius:8px;border:2.5px solid transparent;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center;padding:0;flex-shrink:0}
.cbtn:hover{transform:scale(1.2);box-shadow:0 2px 8px rgba(0,0,0,0.25)}
.cact{border-color:#1e2a35!important;transform:scale(1.15);box-shadow:0 2px 8px rgba(0,0,0,0.3)}
.color-preview{display:flex;align-items:center;gap:7px;margin-top:6px;font-size:12px;color:#4a5a6a}
.cp-dot{width:12px;height:12px;border-radius:4px;flex-shrink:0;border:1px solid rgba(0,0,0,0.1)}
.cp-label{font-weight:600}

.modal-fade-enter-active,.modal-fade-leave-active{transition:opacity .2s,transform .2s}
.modal-fade-enter-from,.modal-fade-leave-to{opacity:0;transform:scale(.97)}
</style>