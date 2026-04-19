<template>
  <div class="page-content">
    <div class="page-header-block">
      <div>
        <h2 class="page-title">Liste des spécialités</h2>
        <p class="page-sub">{{ specialites.length }} spécialité(s) enregistrée(s)</p>
      </div>
      <button class="btn-primary" @click="$emit('go-create')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nouvelle spécialité
      </button>
    </div>

    <!-- Vide -->
    <div v-if="!specialites.length" class="empty-state">
      <div class="empty-icon">📚</div>
      <p>Aucune spécialité. Créez-en une première.</p>
    </div>

    <!-- Liste -->
    <div v-else class="spec-grid">
      <div v-for="s in specialites" :key="s.id" class="spec-card">
        <div class="spec-top" v-if="editId !== s.id">
          <div class="spec-badge">{{ s.code }}</div>
          <div class="spec-actions">
            <button class="icon-btn" @click="startEdit(s)" title="Modifier">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="icon-btn icon-danger" @click="confirmerSuppression(s)" title="Supprimer">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
            </button>
          </div>
        </div>

        <!-- Mode lecture -->
        <div v-if="editId !== s.id">
          <div class="spec-nom">{{ s.nom }}</div>
          <div class="spec-desc" v-if="s.description">{{ s.description }}</div>
          <div class="spec-meta">
            <span v-if="s.date_creation">📅 {{ formatDate(s.date_creation) }}</span>
            <span class="chef-badge" v-if="s.chefs && s.chefs.length">
              👤 {{ s.chefs.map(c=>c.nom).join(', ') }}
            </span>
            <span class="no-chef" v-else>Aucun chef assigné</span>
          </div>
        </div>

        <!-- Mode édition inline -->
        <div v-else class="edit-form">
          <div class="field-block-sm">
            <label class="fl-sm">Nom</label>
            <input v-model="editForm.nom" class="fi-sm"/>
          </div>
          <div class="field-block-sm">
            <label class="fl-sm">Code</label>
            <input v-model="editForm.code" class="fi-sm"/>
          </div>
          <div class="field-block-sm">
            <label class="fl-sm">Description</label>
            <textarea v-model="editForm.description" class="fi-sm" rows="2"/>
          </div>
          <div class="edit-actions">
            <button class="btn-outline-sm" @click="editId=null">Annuler</button>
            <button class="btn-save-sm" @click="sauvegarder(s)">Enregistrer</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modale suppression -->
    <transition name="modal-fade">
      <div v-if="modalSupp" class="overlay" @click.self="modalSupp=null">
        <div class="confirm-modal">
          <div class="confirm-icon"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg></div>
          <h4>Supprimer {{ modalSupp.nom }} ?</h4>
          <p>Cette action est irréversible. Les utilisateurs liés à cette spécialité seront détachés.</p>
          <div class="confirm-btns">
            <button class="btn-outline" @click="modalSupp=null">Annuler</button>
            <button class="btn-danger" @click="supprimerSpec">Supprimer</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'Listespecialites',
  props: { specialites: { type: Array, default: () => [] } },
  emits: ['update-specialite', 'delete-specialite', 'go-create'], 
  data() {
    return { editId: null, editForm: {}, modalSupp: null }
  },
  methods: {
    startEdit(s) {
      this.editId   = s.id
      this.editForm = { nom: s.nom, code: s.code, description: s.description || '', dateCreation: s.date_creation || '' }
    },
    sauvegarder(s) {
      this.$emit('update-specialite', { ...s, ...this.editForm })
      this.editId = null
    },
    confirmerSuppression(s) { this.modalSupp = s },
    supprimerSpec() {
      this.$emit('delete-specialite', this.modalSupp.id)
      this.modalSupp = null
    },
    formatDate(d) {
      if (!d) return ''
      return new Date(d).toLocaleDateString('fr-FR')
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500;600&family=Merriweather:wght@700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.page-content{padding:32px;font-family:'Source Sans 3',sans-serif}
.page-header-block{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;gap:16px;flex-wrap:wrap}
.page-title{font-family:'Merriweather',serif;font-size:20px;color:#1e2a35;margin-bottom:4px}
.page-sub{font-size:13.5px;color:#8a9aaa}
.btn-primary{display:flex;align-items:center;gap:8px;padding:10px 20px;background:#3d6080;color:#fff;border:none;border-radius:10px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.18s}
.btn-primary:hover{background:#2f4f6a}
.empty-state{text-align:center;padding:60px;color:#8a9aaa}
.empty-icon{font-size:48px;margin-bottom:12px}
.spec-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
.spec-card{background:#ddd9d1;border:1.5px solid #c8c4bc;border-radius:14px;padding:20px;transition:box-shadow 0.18s}
.spec-card:hover{box-shadow:0 4px 16px rgba(0,0,0,0.08)}
.spec-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.spec-badge{padding:3px 12px;background:rgba(61,96,128,0.12);color:#3d6080;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:0.04em}
.spec-actions{display:flex;gap:6px}
.icon-btn{width:30px;height:30px;border-radius:7px;border:1.5px solid #c8c4bc;background:#e8e4dc;color:#4a5a6a;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s}
.icon-btn:hover{border-color:#3d6080;color:#3d6080}
.icon-danger:hover{border-color:#c0392b;color:#c0392b}
.spec-nom{font-size:15px;font-weight:700;color:#1e2a35;margin-bottom:6px}
.spec-desc{font-size:13px;color:#4a5a6a;line-height:1.5;margin-bottom:10px}
.spec-meta{display:flex;flex-wrap:wrap;gap:8px;font-size:12px;color:#8a9aaa;align-items:center}
.chef-badge{padding:3px 10px;background:rgba(39,174,96,0.1);color:#1a6b3a;border-radius:20px;font-size:12px;font-weight:600}
.no-chef{font-style:italic;color:#c8c4bc}
.edit-form{display:flex;flex-direction:column;gap:10px}
.field-block-sm{display:flex;flex-direction:column;gap:4px}
.fl-sm{font-size:12px;font-weight:600;color:#4a5a6a}
.fi-sm{padding:7px 10px;background:#e8e4dc;border:1.5px solid #c8c4bc;border-radius:7px;font-size:13px;color:#1e2a35;font-family:inherit;width:100%}
.fi-sm:focus{outline:none;border-color:#3d6080}
.edit-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:4px}
.btn-outline-sm{padding:6px 14px;background:transparent;border:1.5px solid #c8c4bc;border-radius:8px;font-size:12.5px;color:#4a5a6a;cursor:pointer;font-family:inherit}
.btn-save-sm{padding:6px 14px;background:#3d6080;color:#fff;border:none;border-radius:8px;font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:999}
.confirm-modal{background:#ddd9d1;border-radius:16px;padding:32px;max-width:400px;width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.2)}
.confirm-icon{width:52px;height:52px;border-radius:50%;background:rgba(192,57,43,0.12);color:#c0392b;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
.confirm-modal h4{font-size:17px;font-weight:700;color:#1e2a35;margin-bottom:8px}
.confirm-modal p{font-size:13.5px;color:#4a5a6a;line-height:1.6;margin-bottom:22px}
.confirm-btns{display:flex;gap:10px;justify-content:center}
.btn-outline{padding:9px 18px;background:transparent;border:1.5px solid #c8c4bc;border-radius:9px;font-size:13.5px;color:#4a5a6a;cursor:pointer;font-family:inherit}
.btn-outline:hover{border-color:#3d6080;color:#3d6080}
.btn-danger{padding:9px 18px;background:#c0392b;color:#fff;border:none;border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:inherit}
.btn-danger:hover{background:#a93226}
.modal-fade-enter-active{transition:opacity 0.25s}.modal-fade-leave-active{transition:opacity 0.2s}
.modal-fade-enter-from,.modal-fade-leave-to{opacity:0}
</style>