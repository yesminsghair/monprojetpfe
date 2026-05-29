<template>
  <div class="ea-wrapper">

    <!-- ── En-tête ─────────────────────────────────────────────────────── -->
    <div class="ea-header">
      <div>
        <h2 class="vld-page-title">Étudiants affectés</h2>
        <p class="vld-page-sub">
          {{ etudiantsFiltres.length }} étudiant{{ etudiantsFiltres.length !== 1 ? 's' : '' }}
          sur {{ etudiants.length }} sous votre encadrement
        </p>
      </div>

      <div class="ea-header__actions">
        <!-- Export Excel -->
        <button
          v-if="etudiants.length"
          class="btn btn-outline-success d-flex align-items-center gap-2"
          @click="exportExcel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          Excel
        </button>

        <!-- Export PDF -->
        <button
          v-if="etudiants.length"
          class="btn btn-outline-danger d-flex align-items-center gap-2"
          @click="exportPDF"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <path d="M9 13h2a2 2 0 0 0 0-4H9v8"/>
          </svg>
          PDF
        </button>
      </div>
    </div>

    <!-- ── Barre recherche + filtres ──────────────────────────────────── -->
    <div v-if="etudiants.length" class="ea-toolbar mb-3">
      <!-- Recherche -->
      <div class="ea-toolbar__search">
        <svg class="ea-toolbar__icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="recherche"
          type="text"
          class="ea-toolbar__input"
          placeholder="Rechercher par nom, matricule, email…"
        />
        <button v-if="recherche" class="ea-toolbar__clear" @click="recherche = ''" title="Effacer">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="ea-toolbar__divider"></div>

      <!-- Tri -->
      <div class="ea-toolbar__filter">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--vld-text-muted)">
          <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
        </svg>
        <select v-model="tri" class="ea-toolbar__select">
          <option value="nom_asc">Nom A → Z</option>
          <option value="nom_desc">Nom Z → A</option>
          <option value="matricule">Matricule</option>
          <option value="specialite">Spécialité</option>
        </select>
      </div>

      <!-- Réinitialiser filtres -->
      <button
        v-if="recherche"
        class="btn btn-sm btn-link text-danger p-0 ms-auto me-3 text-nowrap"
        @click="reinitialiserFiltres"
      >
        Réinitialiser
      </button>
    </div>

    <!-- ── État vide global ───────────────────────────────────────────── -->
    <div v-if="!etudiants.length" class="vld-state">
      <div class="vld-state__icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
        </svg>
      </div>
      <p class="vld-state__title">Aucun étudiant affecté</p>
      <p class="vld-state__sub">Les affectations n'ont pas encore été finalisées.</p>
    </div>

    <!-- ── Aucun résultat de recherche ───────────────────────────────── -->
    <div v-else-if="!etudiantsFiltres.length" class="vld-state">
      <div class="vld-state__icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
      <p class="vld-state__title">Aucun résultat</p>
      <p class="vld-state__sub">Aucun étudiant ne correspond à votre recherche.</p>
      <button class="btn btn-sm btn-outline-secondary mt-2" @click="reinitialiserFiltres">
        Réinitialiser les filtres
      </button>
    </div>

    <!-- ── Tableau ────────────────────────────────────────────────────── -->
    <div v-else class="table-responsive card">
      <table class="table table-hover mb-0">
        <thead>
          <tr>
            <th style="width:50px"></th>
            <th>Étudiant</th>
            <th>Matricule</th>
            <th>Téléphone</th>
            <th style="width:90px" class="text-center">Fiche</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in etudiantsFiltres" :key="e.id" class="ea-row" @click="ouvrirFiche(e)">
            <td>
              <div class="vld-av vld-av--md vld-av--gold">{{ initiales(e.prenom, e.nom) }}</div>
            </td>
            <td>
              <div class="fw-semibold" style="color:var(--vld-text-strong)">{{ e.prenom }} {{ e.nom }}</div>
              <div v-if="e.email" style="font-size:12px;color:var(--vld-text-muted)">{{ e.email }}</div>
            </td>
            <td>
              <span class="badge bg-light text-secondary border">{{ e.matricule || '—' }}</span>
            </td>
            <td style="font-size:13px;color:var(--vld-text-muted)">{{ e.telephone || '—' }}</td>
            <td class="text-center" @click.stop>
              <button
                class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                title="Voir la fiche complète"
                @click="ouvrirFiche(e)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Voir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── POPUP — Fiche complète étudiant ───────────────────────────── -->
    <Teleport to="body">
      <Transition name="ea-modal">
        <div
          v-if="ficheOuverte"
          class="ea-modal-backdrop"
          @click.self="fermerFiche"
        >
          <div class="ea-modal-dialog">

            <!-- Bouton nav précédent -->
            <button
              v-if="indexFiche > 0"
              class="ea-modal-nav ea-modal-nav--prev"
              @click="naviguerFiche(-1)"
              title="Étudiant précédent"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>

            <!-- Bouton nav suivant -->
            <button
              v-if="indexFiche < etudiantsFiltres.length - 1"
              class="ea-modal-nav ea-modal-nav--next"
              @click="naviguerFiche(1)"
              title="Étudiant suivant"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            <div class="ea-modal-content">

              <!-- Header -->
              <div class="ea-modal-header">
                <div class="ea-modal-avatar">{{ initiales(ficheEtudiant.prenom, ficheEtudiant.nom) }}</div>
                <div class="ea-modal-identity">
                  <h5 class="ea-modal-name">{{ ficheEtudiant.prenom }} {{ ficheEtudiant.nom }}</h5>
                  <span class="ea-modal-counter">{{ indexFiche + 1 }} / {{ etudiantsFiltres.length }}</span>
                </div>
                <button class="ea-modal-close" @click="fermerFiche">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <!-- Corps -->
              <div class="ea-modal-body">

                <!-- Matricule -->
                <div class="ea-field-row">
                  <div class="ea-field">
                    <span class="ea-field__label">Matricule</span>
                    <span class="ea-field__value ea-field__value--badge">{{ ficheEtudiant.matricule || '—' }}</span>
                  </div>
                </div>

                <div class="ea-divider"></div>

                <!-- Email -->
                <div class="ea-field ea-field--full">
                  <span class="ea-field__label">Adresse e-mail</span>
                  <div class="ea-field__with-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <span v-if="ficheEtudiant.email" class="ea-field__value">{{ ficheEtudiant.email }}</span>
                    <span v-else class="ea-field__value">—</span>
                  </div>
                </div>

                <!-- Téléphone -->
                <div class="ea-field ea-field--full">
                  <span class="ea-field__label">Téléphone</span>
                  <div class="ea-field__with-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <span class="ea-field__value">{{ ficheEtudiant.telephone || '—' }}</span>
                  </div>
                </div>

                <!-- Adresse -->
                <div v-if="ficheEtudiant.adresse" class="ea-field ea-field--full">
                  <span class="ea-field__label">Adresse</span>
                  <div class="ea-field__with-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span class="ea-field__value">{{ ficheEtudiant.adresse }}</span>
                  </div>
                </div>

              </div>

              <!-- Raison de contrainte (visible uniquement si définie) -->
              <div v-if="raisonFiche" class="ea-modal-body" style="padding-top:0">
                <div class="ea-divider"></div>
                <div class="ea-field ea-field--full">
                  <span class="ea-field__label" style="color:#d97706">⚠ Contrainte chef</span>
                  <span class="ea-field__value" style="white-space:pre-line;color:#92400e;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:8px 12px;font-size:13px">{{ raisonFiche }}</span>
                </div>
              </div>

              <!-- Footer -->
              <div class="ea-modal-footer">
                <button
                  v-if="ficheEtudiant.email"
                  class="btn btn-primary btn-sm d-flex align-items-center gap-2"
                  @click="copierEmail(ficheEtudiant.email)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copier l'e-mail
                </button>
                <button class="btn btn-outline-secondary btn-sm" @click="fermerFiche">Fermer</button>
              </div>

            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script>
export default {
  name: 'EtudiantsAffectes',
  emits: ['toast'],

  props: {
    etudiants:   { type: Array, default: () => [] },
    contraintes: { type: Array, default: () => [] },
  },

  data () {
    return {
      recherche:        '',
      tri:              'nom_asc',
      filtreSpecialite: '', // filtre par spécialité
      ficheOuverte:     false,
      ficheEtudiant:    {},
      indexFiche:       0,
    }
  },

  computed: {
    // Raison de contrainte liée à l'encadrant de l'étudiant affiché dans la fiche
    raisonFiche () {
      if (!this.ficheEtudiant?.encadrant_id || !this.contraintes?.length) return null
      const c = this.contraintes.find(
        c => c.raison && Number(c.encadrant_id) === Number(this.ficheEtudiant.encadrant_id)
      )
      return c?.raison || null
    },

    // Liste unique des spécialités pour le filtre
    specialites () {
      return [...new Set(this.etudiants.map(e => e.specialite).filter(Boolean))].sort()
    },

    etudiantsFiltres () {
      let liste = [...this.etudiants]

      // Recherche textuelle
      if (this.recherche.trim()) {
        const q = this.recherche.trim().toLowerCase()
        liste = liste.filter(e =>
          [e.prenom, e.nom, e.matricule, e.email, e.telephone, e.specialite]
            .some(v => v && v.toLowerCase().includes(q))
        )
      }

      // Filtre spécialité
      if (this.filtreSpecialite) {
        liste = liste.filter(e => e.specialite === this.filtreSpecialite)
      }

      // Tri
      liste.sort((a, b) => {
        if (this.tri === 'nom_asc')    return (a.nom + a.prenom).localeCompare(b.nom + b.prenom)
        if (this.tri === 'nom_desc')   return (b.nom + b.prenom).localeCompare(a.nom + a.prenom)
        if (this.tri === 'matricule')  return (a.matricule || '').localeCompare(b.matricule || '')
        if (this.tri === 'specialite') return (a.specialite || '').localeCompare(b.specialite || '')
        return 0
      })

      return liste
    },
  },

  methods: {
    initiales (prenom = '', nom = '') {
      return `${prenom[0] ?? ''}${nom[0] ?? ''}`.toUpperCase() || '?'
    },

    reinitialiserFiltres () {
      this.recherche        = ''
      this.filtreSpecialite = ''
    },

    ouvrirFiche (etudiant) {
      this.indexFiche    = this.etudiantsFiltres.findIndex(e => e.id === etudiant.id)
      this.ficheEtudiant = etudiant
      this.ficheOuverte  = true
    },

    fermerFiche () {
      this.ficheOuverte  = false
      this.ficheEtudiant = {}
    },

    naviguerFiche (delta) {
      const newIndex = this.indexFiche + delta
      if (newIndex < 0 || newIndex >= this.etudiantsFiltres.length) return
      this.indexFiche    = newIndex
      this.ficheEtudiant = this.etudiantsFiltres[newIndex]
    },

    copierEmail (email) {
      navigator.clipboard.writeText(email).then(() => {
        this.$emit('toast', { message: 'E-mail copié dans le presse-papiers', type: 'ok' })
      }).catch(() => {
        this.$emit('toast', { message: 'Impossible de copier l\'e-mail', type: 'err' })
      })
    },

    // ── Export CSV ───────────────────────────────────────────────────────
    exportCSV () {
      const rows = [['#', 'Prénom', 'Nom', 'Matricule', 'Spécialité', 'Email', 'Téléphone', 'Adresse']]
      this.etudiantsFiltres.forEach((e, i) => {
        rows.push([
          i + 1, e.prenom, e.nom,
          e.matricule || '', e.specialite || '', e.email || '',
          e.telephone || '', e.adresse || '',
        ])
      })
      const csv  = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      this._download(blob, `etudiants_affectes_${this._today()}.csv`)
      this.$emit('toast', { message: 'Export CSV téléchargé', type: 'ok' })
    },

    // ── Export Excel (XLSX via HTML table trick — sans dépendance) ───────
    exportExcel () {
      const headers = ['#', 'Prénom', 'Nom', 'Matricule', 'Spécialité', 'Email', 'Téléphone', 'Adresse']
      const rows = this.etudiantsFiltres.map((e, i) => [
        i + 1, e.prenom, e.nom,
        e.matricule || '', e.specialite || '', e.email || '',
        e.telephone || '', e.adresse || '',
      ])

      const tableHtml = `
        <html xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head><meta charset="UTF-8">
        <style>
          th { background:#2563eb; color:#fff; font-weight:bold; }
          td,th { border:1px solid #ccc; padding:6px 10px; }
          table { border-collapse:collapse; }
        </style>
        </head><body><table>
          <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
          <tbody>${rows.map(r => `<tr>${r.map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody>
        </table></body></html>`

      const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' })
      this._download(blob, `etudiants_affectes_${this._today()}.xls`)
      this.$emit('toast', { message: 'Export Excel téléchargé', type: 'ok' })
    },

    // ── Export PDF (impression navigateur) ───────────────────────────────
    exportPDF () {
      const headers = ['#', 'Prénom', 'Nom', 'Matricule', 'Spécialité', 'Email', 'Téléphone']
      const rows = this.etudiantsFiltres.map((e, i) => [
        i + 1, e.prenom, e.nom,
        e.matricule || '—', e.specialite || '—', e.email || '—', e.telephone || '—',
      ])

      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
        <title>Étudiants affectés</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family:'Inter',sans-serif; font-size:12px; color:#1e293b; padding:32px; }
          h1 { font-size:20px; font-weight:700; color:#2563eb; margin-bottom:4px; }
          .sub { color:#64748b; font-size:12px; margin-bottom:24px; }
          table { width:100%; border-collapse:collapse; }
          thead tr { background:#2563eb; color:#fff; }
          th { padding:9px 12px; text-align:left; font-weight:600; font-size:11px; text-transform:uppercase; letter-spacing:.05em; }
          td { padding:9px 12px; border-bottom:1px solid #e2e8f0; }
          tr:nth-child(even) td { background:#f8fafc; }
          .footer { margin-top:24px; text-align:right; color:#94a3b8; font-size:10px; }
        </style>
      </head><body>
        <h1>Étudiants affectés</h1>
        <p class="sub">Généré le ${new Date().toLocaleDateString('fr-FR')} — ${rows.length} étudiant(s)</p>
        <table>
          <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
          <tbody>${rows.map(r => `<tr>${r.map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
        <p class="footer">Document confidentiel — usage interne</p>
      </body></html>`

      const win = window.open('', '_blank')
      win.document.write(html)
      win.document.close()
      win.onload = () => { win.print() }
    },

    // ── Helpers ───────────────────────────────────────────────────────────
    _today () { return new Date().toISOString().slice(0, 10) },

    _download (blob, filename) {
      const url = URL.createObjectURL(blob)
      const a   = Object.assign(document.createElement('a'), { href: url, download: filename })
      a.click()
      URL.revokeObjectURL(url)
    },
  },
}
</script>

<style scoped>
/* ── Wrapper ────────────────────────────────────────────────────────── */
.ea-wrapper { container-type: inline-size; }

/* ── Header ─────────────────────────────────────────────────────────── */
.ea-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}
.ea-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* ── Toolbar ─────────────────────────────────────────────────────────── */
.ea-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;               /* keep everything on one line */
  gap: 0;
  padding: 0;
  overflow: hidden;
  /* Own surface — no Bootstrap .card needed */
  background:    var(--vld-surface);
  border:        1.5px solid var(--vld-border);
  border-radius: var(--vld-r-xl);
  box-shadow:    var(--vld-shadow-card);
}
.ea-toolbar__search {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 220px;
  padding: 10px 14px;
  min-width: 0;
}
.ea-toolbar__icon { color: var(--vld-text-muted); flex-shrink: 0; }
.ea-toolbar__input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 13.5px;
  color: var(--vld-text-strong);
  width: 100%;
  min-width: 0;
}
.ea-toolbar__input::placeholder { color: var(--vld-text-muted); }
.ea-toolbar__clear {
  background: none;
  border: none;
  padding: 2px;
  color: var(--vld-text-muted);
  cursor: pointer;
  flex-shrink: 0;
  line-height: 1;
}
.ea-toolbar__clear:hover { color: var(--vld-danger, #dc2626); }
.ea-toolbar__divider {
  width: 1px;
  height: 36px;
  background: var(--vld-border, #e2e8f0);
  flex-shrink: 0;
}
.ea-toolbar__filter {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  flex-shrink: 0;
}
.ea-toolbar__select {
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: var(--vld-text-strong);
  cursor: pointer;
  max-width: 180px;
}

/* ── Row hover ───────────────────────────────────────────────────────── */
.ea-row { cursor: pointer; }

/* ── Modal backdrop ─────────────────────────────────────────────────── */
.ea-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(3px);
  z-index: 1055;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.ea-modal-dialog {
  position: relative;
  width: 100%;
  max-width: 500px;
}

/* ── Navigation arrows ───────────────────────────────────────────────── */
.ea-modal-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: #fff;
  border: 1px solid var(--vld-border, #e2e8f0);
  border-radius: 50%;
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,.12);
  z-index: 10;
  transition: background .15s;
}
.ea-modal-nav:hover { background: var(--vld-primary-50, #eff6ff); }
.ea-modal-nav--prev { left: -48px; }
.ea-modal-nav--next { right: -48px; }

/* ── Modal content ───────────────────────────────────────────────────── */
.ea-modal-content {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(15, 23, 42, .25);
}

/* ── Modal header ────────────────────────────────────────────────────── */
.ea-modal-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px 18px;
  background: var(--vld-primary, #2563eb);
  position: relative;
}
.ea-modal-avatar {
  width: 52px; height: 52px;
  border-radius: 50%;
  background: rgba(255,255,255,.2);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
  flex-shrink: 0;
  border: 2px solid rgba(255,255,255,.35);
}
.ea-modal-identity { flex: 1; min-width: 0; }
.ea-modal-name {
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ea-modal-specialite {
  display: block;
  color: rgba(255,255,255,.8);
  font-size: 12px;
}
.ea-modal-counter {
  display: block;
  color: rgba(255,255,255,.55);
  font-size: 11px;
  margin-top: 2px;
}
.ea-modal-close {
  background: rgba(255,255,255,.15);
  border: none;
  border-radius: 8px;
  width: 32px; height: 32px;
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background .15s;
}
.ea-modal-close:hover { background: rgba(255,255,255,.3); }

/* ── Modal body ──────────────────────────────────────────────────────── */
.ea-modal-body { padding: 20px 24px 8px; }
.ea-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.ea-field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; }
.ea-field--full { grid-column: 1 / -1; }
.ea-field__label {
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: .07em;
  color: var(--vld-text-muted, #94a3b8);
  font-weight: 600;
}
.ea-field__value { font-size: 14px; color: var(--vld-text-strong, #1e293b); font-weight: 500; }
.ea-field__value--badge {
  display: inline-block;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 2px 10px;
  font-size: 13px;
  font-family: monospace;
}
.ea-field__with-icon { display: flex; align-items: center; gap: 7px; color: var(--vld-text-muted, #64748b); }
.ea-field__with-icon .ea-field__value { color: var(--vld-text-strong, #1e293b); }
.ea-field__link { color: var(--vld-primary, #2563eb); text-decoration: none; font-size: 14px; font-weight: 500; }
.ea-field__link:hover { text-decoration: underline; }
.ea-divider { height: 1px; background: var(--vld-border, #e2e8f0); margin: 0 0 16px; }

/* ── Modal footer ────────────────────────────────────────────────────── */
.ea-modal-footer {
  padding: 12px 24px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* ── Modal transition ────────────────────────────────────────────────── */
.ea-modal-enter-active,
.ea-modal-leave-active { transition: opacity .2s ease, transform .2s ease; }
.ea-modal-enter-from,
.ea-modal-leave-to { opacity: 0; transform: scale(.96); }
</style>