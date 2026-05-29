<template>
  <div>
    <!-- ══ Header ══════════════════════════════════════════════════════════════ -->
    <div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
      <div>
        <h2 class="vld-page-title">Affectation des encadrants</h2>
        <p class="vld-page-sub">Définissez les règles et procédez à l'affectation des encadrants aux étudiants</p>
      </div>
      <!-- Actions always visible once affectations exist -->
      <div class="d-flex gap-2 flex-wrap" v-if="affectations.length && etape !== 'mode' && etape !== 'contraintes'">
        <button class="btn btn-outline-primary d-flex align-items-center gap-2" @click="exporterListe">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exporter CSV
        </button>
        <button v-if="diffuse" class="btn btn-outline-secondary d-flex align-items-center gap-2" @click="etape='consultation'">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Consulter
        </button>
      </div>
    </div>

    <!-- Global error banner -->
    <div v-if="errorMessage" class="vld-banner vld-banner--danger mb-3" role="alert">
      <div class="vld-banner__icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <div class="flex-grow-1">{{ errorMessage }}</div>
      <button class="btn-close btn-close-sm ms-2" @click="errorMessage=''"></button>
    </div>

    <!-- ══ Stepper ══════════════════════════════════════════════════════════════ -->
    <div class="d-flex align-items-center mb-4 flex-wrap gap-2" v-if="etape !== 'consultation'">
      <template v-for="(e, i) in etapes" :key="e.key">
        <div class="d-flex align-items-center gap-2">
          <div class="stepper-num"
            :class="etape===e.key && !(diffuse && e.key==='validation') ? 'stepper-active' : etapeIndex>i || (diffuse && e.key==='validation') ? 'stepper-done' : ''">
            <svg v-if="etapeIndex>i || (diffuse && e.key==='validation')" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span class="stepper-lbl" :class="etape===e.key && !(diffuse && e.key==='validation') ? 'text-primary fw-bold' : etapeIndex>i || (diffuse && e.key==='validation') ? 'text-success fw-semibold' : ''">{{ e.label }}</span>
        </div>
        <div v-if="i < etapes.length-1" class="stepper-line"></div>
      </template>
    </div>

    <!-- ════════════════════════════════════════════════════════════════════════
         ÉTAPE 1 : Mode
    ════════════════════════════════════════════════════════════════════════════ -->
    <div v-if="etape === 'mode'" class="card">
      <div class="card-header">Choisir le mode d'affectation</div>
      <div class="card-body">
        <div class="row g-3 mb-4">
          <div v-for="m in modes" :key="m.key" class="col-12 col-md-4">
            <div class="mode-card" :class="{ 'mode-selected': modeChoisi===m.key }" @click="modeChoisi=m.key">
              <div style="font-size:28px;margin-bottom:10px">{{ m.icon }}</div>
              <div class="fw-bold mb-1" style="font-size:14px;color:var(--vld-text-strong)">{{ m.nom }}</div>
              <div style="font-size:12.5px;color:var(--vld-text-muted);line-height:1.5">{{ m.desc }}</div>
              <span v-if="modeChoisi===m.key" class="mode-check">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#27ae60" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
            </div>
          </div>
        </div>
        <div v-if="modeChoisi==='manuel'" class="vld-banner vld-banner--info mb-4">
          <div class="vld-banner__icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
          <div>Les étudiants enverront leurs demandes aux encadrants disponibles. L'affectation finale sera automatisée à partir des demandes acceptées.</div>
        </div>
        <div class="d-flex justify-content-end">
          <button class="btn btn-primary d-flex align-items-center gap-2" @click="confirmerMode" :disabled="!modeChoisi">
            Confirmer le mode <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════════════════════════════
         ÉTAPE 2 : Contraintes
    ════════════════════════════════════════════════════════════════════════════ -->
    <div v-if="etape === 'contraintes'" class="card">
      <div class="card-header">Contraintes d'affectation</div>
      <div class="card-body">
        <!-- Capacity gap warning -->
        <!-- Bilan capacité / étudiants -->
        <div class="cap-summary mb-4">
          <!-- Header bar -->
          <div class="cap-summary__header">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Bilan de capacité
          </div>
          <!-- Counters row -->
          <div class="cap-summary__counts">
            <div class="cap-count">
              <span class="cap-count__num cap-count__num--blue">{{ totalEtudiants }}</span>
              <span class="cap-count__lbl">Étudiants dans la spécialité</span>
            </div>
            <div class="cap-count__sep">—</div>
            <div class="cap-count">
              <span class="cap-count__num" :class="totalSlots >= totalEtudiants ? 'cap-count__num--green' : 'cap-count__num--red'">{{ totalSlots }}</span>
              <span class="cap-count__lbl">Places déclarées par les encadrants</span>
            </div>
            <div class="cap-count__sep">—</div>
            <div class="cap-count">
              <span class="cap-count__num" :class="capaciteGap < 0 ? 'cap-count__num--red' : 'cap-count__num--green'">
                {{ Math.abs(capaciteGap) }}
              </span>
              <span class="cap-count__lbl">{{ capaciteGap < 0 ? 'Sans encadrant' : 'Places en réserve' }}</span>
            </div>
          </div>
          <!-- Progress bar -->
          <div class="cap-summary__bar-wrap">
            <div class="cap-summary__bar-track">
              <div class="cap-summary__bar-fill"
                :style="{
                  width: Math.min(100, totalEtudiants > 0 ? Math.round(totalSlots / totalEtudiants * 100) : 0) + '%',
                  background: capaciteGap < 0 ? '#e74c3c' : capaciteGap === 0 ? '#f39c12' : '#27ae60'
                }"></div>
            </div>
            <span class="cap-summary__bar-pct" :style="{ color: capaciteGap < 0 ? '#e74c3c' : '#27ae60' }">
              {{ totalEtudiants > 0 ? Math.round(totalSlots / totalEtudiants * 100) : 0 }}%
            </span>
          </div>
          <!-- Alert message -->
          <div class="cap-summary__alert" :class="capaciteGap < 0 ? 'cap-summary__alert--danger' : capaciteGap === 0 ? 'cap-summary__alert--warning' : 'cap-summary__alert--ok'">
            <svg v-if="capaciteGap < 0" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <svg v-else-if="capaciteGap === 0" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span v-if="capaciteGap < 0">
              Vous avez <strong>{{ totalEtudiants }} étudiant(s)</strong> dans votre département mais seulement
              <strong>{{ totalSlots }} place(s)</strong> déclarées par les encadrants.
              Il reste <strong>{{ Math.abs(capaciteGap) }} étudiant(s) sans affectation</strong> possible.
              Utilisez les contraintes ci-dessous pour ajuster les capacités.
            </span>
            <span v-else-if="capaciteGap === 0">
              Capacité exacte — <strong>{{ totalEtudiants }} étudiant(s)</strong> pour
              <strong>{{ totalSlots }} place(s)</strong>. Aucune marge : toute modification
              ou exclusion créera un déficit.
            </span>
            <span v-else>
              Tous les étudiants peuvent être affectés — <strong>{{ totalEtudiants }} étudiant(s)</strong> pour
              <strong>{{ totalSlots }} place(s)</strong>
              (<strong>{{ capaciteGap }} place(s) en réserve</strong>).
            </span>
          </div>
        </div>

        <!-- Date limite (mode manuel uniquement) -->
        <div v-if="modeChoisi === 'manuel'" class="contraintes-section mb-3">
          <div class="contraintes-section__header">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Date limite pour les demandes d'encadrement
          </div>
          <div class="p-3">
            <div class="row g-2 align-items-end">
              <div class="col-12 col-md-4">
                <label class="form-label mb-1" style="font-size:12px">Date limite <span class="text-danger">*</span></label>
                <input v-model="dateLimite" type="date" class="form-control form-control-sm" :min="today" />
              </div>
              <div class="col-12 col-md-8">
                <p class="mb-0" style="font-size:12px;color:var(--vld-text-muted)">
                  Les étudiants seront notifiés de cette date limite. Passé ce délai, ils ne pourront plus soumettre de demande.
                </p>
              </div>
            </div>
            <div v-if="dateLimite" class="mt-2">
              <span class="badge bg-warning text-dark">
                Délai : {{ new Date(dateLimite).toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' }) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Panel 1 : Voeux encadrants -->
        <div class="contraintes-section mb-3">
          <div class="contraintes-section__header">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Voeux soumis par les encadrants
            <span class="badge bg-secondary ms-1" style="font-size:11px;font-weight:500">Lecture seule</span>
          </div>
          <div v-if="encadrants.length" class="table-responsive">
            <table class="table table-hover mb-0" style="font-size:13px">
              <thead>
                <tr><th>Encadrant</th><th>Disponibilité</th><th>Cap. déclarée</th><th>Déjà affectés</th><th>Thèmes</th><th>Co-tutelle</th><th>Commentaire</th></tr>
              </thead>
              <tbody>
                <tr v-for="enc in encadrants" :key="enc.id" :class="enc.disponibilite==='non' ? 'table-danger opacity-75' : ''">
                  <td class="fw-semibold">{{ enc.nom_complet }}</td>
                  <td>
                    <span v-if="enc.disponibilite==='non'" class="badge bg-danger">Indisponible</span>
                    <span v-else-if="enc.disponibilite==='partielle'" class="badge bg-warning text-dark">Partielle ⚡</span>
                    <span v-else class="badge bg-success">Disponible</span>
                  </td>
                  <td>{{ effectiveCap(enc) }}<span v-if="capOverrideFor(enc.id)" class="badge bg-info text-dark ms-1" style="font-size:10px">modifié</span></td>
                  <td>{{ enc.nb_affectes }}</td>
                  <td style="max-width:150px;white-space:normal">{{ enc.themes||'—' }}</td>
                  <td>{{ enc.cotutelle ? '✅' : '—' }}</td>
                  <td style="max-width:170px;white-space:normal;color:var(--vld-text-muted)">{{ enc.commentaire||'—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="py-3 text-center" style="font-size:13px;color:var(--vld-text-muted)">Aucun voeu soumis pour votre spécialité.</div>
        </div>

        <!-- Panel 2 : Contraintes chef (CRUD) -->
        <div class="contraintes-section">
          <div class="contraintes-section__header">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Contraintes manuelles du chef
            <button class="btn btn-sm btn-outline-primary ms-auto d-flex align-items-center gap-1" @click="ouvrirFormContrainte(null)">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Ajouter
            </button>
          </div>

          <!-- Contrainte form -->
          <div v-if="showContrainteForm" class="contrainte-form">
            <div class="row g-2 align-items-end">
              <div class="col-12 col-md-3">
                <label class="form-label mb-1" style="font-size:12px">Type de contrainte</label>
                <select v-model="nouvelleContrainte.type" class="form-select form-select-sm" @change="resetContrainteFields">
                  <option value="exclure_encadrant">Exclure un encadrant</option>
                  <option value="exclure_paire">Exclure une paire étudiant–encadrant</option>
                  <option value="forcer_paire">Forcer une paire étudiant–encadrant</option>
                  <option value="cap_override">Modifier la capacité max d'un encadrant</option>
                </select>
              </div>
              <div class="col-12 col-md-3">
                <label class="form-label mb-1" style="font-size:12px">Encadrant</label>
                <select v-model="nouvelleContrainte.encadrant_id" class="form-select form-select-sm">
                  <option :value="null">— Choisir —</option>
                  <option v-for="enc in encadrants" :key="enc.id" :value="enc.id">{{ enc.nom_complet }}</option>
                </select>
              </div>
              <div v-if="['exclure_paire','forcer_paire'].includes(nouvelleContrainte.type)" class="col-12 col-md-3">
                <label class="form-label mb-1" style="font-size:12px">Étudiant</label>
                <select v-model="nouvelleContrainte.etudiant_id" class="form-select form-select-sm">
                  <option :value="null">— Choisir —</option>
                  <option v-for="et in etudiants" :key="et.id" :value="et.id">{{ et.prenom }} {{ et.nom }}</option>
                </select>
              </div>
              <div v-if="nouvelleContrainte.type === 'cap_override'" class="col-12 col-md-2">
                <label class="form-label mb-1" style="font-size:12px">Nouvelle capacité max</label>
                <input v-model.number="nouvelleContrainte.cap" type="number" min="0" max="20" class="form-control form-control-sm" style="width:80px" />
              </div>
              <div class="col-12 col-md-3">
                <label class="form-label mb-1" style="font-size:12px">Raison (optionnel)</label>
                <input v-model="nouvelleContrainte.raison" type="text" class="form-control form-control-sm" placeholder="Ex: conflit d'intérêt…" />
              </div>
              <div class="col-12 col-md-auto d-flex gap-1 mt-1">
                <button class="btn btn-sm btn-primary" @click="enregistrerContrainte" :disabled="!contrainteValide">
                  {{ editingContrainteIndex !== null ? 'Modifier' : 'Ajouter' }}
                </button>
                <button class="btn btn-sm btn-outline-secondary" @click="annulerContrainte">✕</button>
              </div>
            </div>
            <div class="mt-2" style="font-size:12px;color:var(--vld-text-muted)">
              <span v-if="nouvelleContrainte.type==='exclure_encadrant'">L'encadrant sera complètement ignoré par l'algorithme.</span>
              <span v-else-if="nouvelleContrainte.type==='exclure_paire'">L'algorithme ne mettra jamais cet étudiant avec cet encadrant.</span>
              <span v-else-if="nouvelleContrainte.type==='forcer_paire'">Cette paire est verrouillée avant tout autre distribution.</span>
              <span v-else-if="nouvelleContrainte.type==='cap_override'">Remplace la capacité déclarée pour cette session uniquement.</span>
            </div>
          </div>

          <!-- Contraintes list -->
          <div v-if="contraintes.length" class="table-responsive">
            <table class="table table-hover mb-0" style="font-size:13px">
              <thead><tr><th>Type</th><th>Encadrant</th><th>Étudiant / Valeur</th><th>Raison</th><th style="width:70px"></th></tr></thead>
              <tbody>
                <tr v-for="(c, i) in contraintes" :key="i">
                  <td><span class="badge" :class="typeBadgeClass(c.type)">{{ typeLabel(c.type) }}</span></td>
                  <td class="fw-semibold">{{ nomEncadrant(c.encadrant_id) }}</td>
                  <td>
                    <span v-if="c.type==='cap_override'">{{ c.cap }} étudiant(s)</span>
                    <span v-else-if="c.etudiant_id">{{ nomEtudiant(c.etudiant_id) }}</span>
                    <span v-else style="color:var(--vld-text-muted)">—</span>
                  </td>
                  <td style="color:var(--vld-text-muted)">{{ c.raison||'—' }}</td>
                  <td>
                    <div class="d-flex gap-1">
                      <button class="vld-icon-btn" @click="ouvrirFormContrainte(i)" title="Modifier">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button class="vld-icon-btn vld-icon-btn--del" @click="supprimerContrainte(i)" title="Supprimer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="py-3 text-center" style="font-size:13px;color:var(--vld-text-muted)">
            Aucune contrainte définie. L'algorithme utilisera uniquement les voeux des encadrants.
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2 pt-3 border-top mt-3">
          <button class="btn btn-outline-secondary" @click="retourVersMode">Retour</button>
          <div class="d-flex flex-column align-items-end gap-1">
            <button class="btn btn-primary d-flex align-items-center gap-2" @click="allerAffectation" :disabled="capaciteGap !== 0">
              Passer à l'affectation
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <span v-if="capaciteGap !== 0" style="font-size:11.5px;color:#e74c3c;font-weight:500;">
              <span v-if="capaciteGap < 0">⚠️ {{ Math.abs(capaciteGap) }} étudiant(s) sans place — ajustez les capacités</span>
              <span v-else>⚠️ {{ capaciteGap }} place(s) en trop — réduisez les capacités</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════════════════════════════
         ÉTAPE 3 : Affectation
    ════════════════════════════════════════════════════════════════════════════ -->
    <div v-if="etape === 'affectation'" class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span>{{ modeLabel }} — Tableau des affectations</span>
        <span class="badge bg-primary bg-opacity-10 text-primary">{{ modeIcon }} {{ modeLabel }}</span>
      </div>
      <div class="card-body">
        <div v-if="loading" class="vld-state"><div class="vld-spinner mx-auto mb-3"></div><p>Chargement...</p></div>

        <!-- Overflow notice -->
        <div v-if="overflowNote && !loading" class="vld-banner vld-banner--danger mb-3">
          <div class="vld-banner__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div>{{ overflowNote }}</div>
        </div>

        <!-- Accord mutuel -->
        <div v-if="!loading && modeChoisi === 'manuel'">
          <div class="vld-banner vld-banner--info mb-3">
            <div class="vld-banner__icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
            <div><strong>Mode : Accord mutuel</strong><br><span style="font-size:13px">Les étudiants envoient leurs demandes aux encadrants. Une fois acceptée, l'affectation est confirmée.</span></div>
          </div>
          <div v-if="affectations.length" class="table-responsive">
            <table class="table table-hover mb-0">
              <thead><tr><th>Étudiant</th><th>Encadrant</th><th>Statut</th></tr></thead>
              <tbody>
                <tr v-for="aff in affectations" :key="aff.etudiant_id">
                  <td><div class="fw-semibold">{{ aff.etudiant }}</div><div style="font-size:12px;color:var(--vld-text-muted)">{{ aff.matricule }}</div></td>
                  <td>{{ aff.encadrant||'—' }}</td>
                  <td><span class="badge" :class="aff.encadrant_id ? 'bg-success' : 'bg-warning text-dark'">{{ aff.encadrant_id ? 'Affecté' : 'En attente' }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="vld-state"><p class="vld-state__title">Aucune demande acceptée pour le moment.</p></div>
        </div>

        <!-- Aléatoire -->
        <div v-else-if="!loading && modeChoisi === 'aleatoire'">
          <div v-if="!affectations.length" class="text-center py-5">
            <p style="color:var(--vld-text-muted);margin-bottom:20px">L'algorithme distribue les étudiants aux encadrants selon les contraintes définies.</p>
            <button class="btn btn-primary d-flex align-items-center gap-2 mx-auto" @click="lancerAffectation" :disabled="loading">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>
              Lancer l'affectation automatique
            </button>
          </div>
          <AffectationsTable v-if="affectations.length" :affectations="affectations" :encadrants="encadrantsActifs" @update-nom="updateEncadrantNom" @retirer="retirerAffectation" editable />
        </div>

        <!-- Semi -->
        <div v-else-if="!loading && modeChoisi === 'semi'">
          <div class="p-3 rounded mb-4" style="background:var(--vld-surface-alt);border:1.5px solid var(--vld-border)">
            <label class="form-label">Nombre d'étudiants à affecter automatiquement</label>
            <div class="d-flex align-items-center gap-2 mt-2">
              <button type="button" class="btn btn-outline-secondary btn-sm" @click="nbPreFill > 1 && nbPreFill--" :disabled="nbPreFill <= 1">−</button>
              <input type="number" v-model.number="nbPreFill" class="form-control" style="width:70px;text-align:center" :min="1" :max="totalEtudiants" />
              <button type="button" class="btn btn-outline-secondary btn-sm" @click="nbPreFill < totalEtudiants && nbPreFill++" :disabled="nbPreFill >= totalEtudiants">+</button>
              <span style="font-size:12px;color:var(--vld-text-muted)">/ {{ totalEtudiants }}</span>
              <button class="btn btn-primary btn-sm ms-2" @click="lancerAffectation" :disabled="loading">Lancer le pré-remplissage</button>
            </div>
          </div>
          <AffectationsTable v-if="affectations.length" :affectations="affectations" :encadrants="encadrantsActifs" @update-nom="updateEncadrantNom" @retirer="retirerAffectation" editable />
        </div>

        <div class="d-flex justify-content-end gap-2 pt-3 border-top mt-3">
          <button class="btn btn-outline-secondary" @click="etape='contraintes'">Retour</button>
          <button v-if="affectations.length && modeChoisi!=='manuel'" class="btn btn-outline-danger" @click="reinitialiser">Réinitialiser</button>
          <button class="btn btn-primary" @click="etape='validation'" :disabled="!affectations.length && modeChoisi!=='manuel'">
            Valider les affectations →
          </button>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════════════════════════════
         ÉTAPE 4 : Validation & Diffusion
    ════════════════════════════════════════════════════════════════════════════ -->
    <div v-if="etape === 'validation'" class="card">
      <div class="card-header">Récapitulatif & Diffusion</div>
      <div class="card-body">
        <div v-if="overflowNote" class="vld-banner vld-banner--danger mb-4">
          <div class="vld-banner__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div>{{ overflowNote }}</div>
        </div>

        <!-- Stats -->
        <div class="row g-3 mb-4">
          <div class="col-4 text-center">
            <div class="p-3 rounded" style="background:var(--vld-surface-alt);border:1.5px solid var(--vld-border)">
              <div style="font-family:var(--vld-font-display);font-size:28px;font-weight:700;color:#27ae60">{{ affectations.filter(a=>a.encadrant_id).length }}</div>
              <div style="font-size:12px;color:var(--vld-text-muted)">Affectés</div>
            </div>
          </div>
          <div class="col-4 text-center">
            <div class="p-3 rounded" style="background:var(--vld-surface-alt);border:1.5px solid var(--vld-border)">
              <div style="font-family:var(--vld-font-display);font-size:28px;font-weight:700;color:var(--vld-accent)">{{ affectations.filter(a=>!a.encadrant_id).length }}</div>
              <div style="font-size:12px;color:var(--vld-text-muted)">Non affectés</div>
            </div>
          </div>
          <div class="col-4 text-center">
            <div class="p-3 rounded" style="background:var(--vld-surface-alt);border:1.5px solid var(--vld-border)">
              <div style="font-family:var(--vld-font-display);font-size:28px;font-weight:700;color:var(--vld-primary)">{{ new Set(affectations.map(a=>a.encadrant_id).filter(Boolean)).size }}</div>
              <div style="font-size:12px;color:var(--vld-text-muted)">Encadrants</div>
            </div>
          </div>
        </div>

        <!-- Récap table (read-only) -->
        <div class="table-responsive mb-4">
          <table class="table table-hover mb-0">
            <thead><tr><th>Étudiant</th><th>Matricule</th><th>Encadrant</th><th>Statut</th></tr></thead>
            <tbody>
              <tr v-for="aff in affectations" :key="aff.etudiant_id">
                <td class="fw-semibold">{{ aff.etudiant }}</td>
                <td style="font-size:12.5px;color:var(--vld-text-muted)">{{ aff.matricule }}</td>
                <td>{{ aff.encadrant||'—' }}</td>
                <td><span class="badge" :class="aff.encadrant_id ? 'bg-success' : 'bg-warning text-dark'">{{ aff.encadrant_id ? 'Affecté' : 'En attente' }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Diffusion status banner -->
        <div v-if="diffuse" class="vld-banner vld-banner--success mb-4">
          <div class="vld-banner__icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div class="vld-banner__body">
            <div class="vld-banner__title">Liste diffusée</div>
            <div class="vld-banner__sub">Encadrants et étudiants voient les résultats. Vous pouvez modifier et re-diffuser.</div>
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2 pt-3 border-top">
          <!-- Réinitialiser -->
          <button v-if="diffuse || affectations.length" class="btn btn-outline-danger d-flex align-items-center gap-2" @click="confirmerReinit">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.85"/></svg>
            Réinitialiser
          </button>
          <!-- Modifier (retour à l'étape affectation en mode édition) -->
          <button class="btn btn-outline-secondary d-flex align-items-center gap-2" @click="etape='affectation'">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            {{ diffuse ? 'Modifier' : 'Retour' }}
          </button>
          <!-- Diffuser / Re-diffuser -->
          <button class="btn btn-success d-flex align-items-center gap-2" @click="diffuser" :disabled="saving">
            <span v-if="saving" class="vld-spinner-sm"></span>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 2 11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            {{ saving ? 'Diffusion...' : diffuse ? 'Re-diffuser' : 'Diffuser la liste finale' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════════════════════════════
         CONSULTATION : Vue en lecture avec recherche, filtres et édition inline
    ════════════════════════════════════════════════════════════════════════════ -->
    <div v-if="etape === 'consultation'" class="card">
      <div class="card-header d-flex justify-content-between align-items-center gap-2 flex-wrap">
        <div class="d-flex align-items-center gap-2">
          <span>Liste des affectations</span>
          <span class="badge bg-primary bg-opacity-10 text-primary">{{ modeIcon }} {{ modeLabel }}</span>
          <span v-if="diffuse" class="badge bg-success">Diffusée</span>
          <span v-else class="badge bg-warning text-dark">Non diffusée</span>
        </div>
        <button class="btn btn-sm btn-outline-secondary" @click="etape='validation'">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Retour
        </button>
      </div>
      <div class="card-body">

        <!-- Toolbar: search + filters + stats -->
        <div class="d-flex gap-2 mb-3 flex-wrap align-items-center">
          <!-- Search -->
          <div class="position-relative" style="flex:1;min-width:200px">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--vld-text-muted)"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="consultSearch" type="text" class="form-control form-control-sm" style="padding-left:32px" placeholder="Rechercher étudiant ou encadrant…" />
          </div>
          <!-- Filtre statut -->
          <select v-model="consultFilterStatut" class="form-select form-select-sm" style="width:160px">
            <option value="">Tous les statuts</option>
            <option value="affecte">Affectés</option>
            <option value="non_affecte">Non affectés</option>
          </select>
          <!-- Filtre encadrant -->
          <select v-model="consultFilterEncadrant" class="form-select form-select-sm" style="width:200px">
            <option value="">Tous les encadrants</option>
            <option v-for="enc in encadrants" :key="enc.id" :value="enc.id">{{ enc.nom_complet }}</option>
          </select>
          <!-- Stats badge -->
          <span class="badge bg-secondary ms-auto">{{ consultFiltered.length }} / {{ affectations.length }}</span>
          <!-- Export CSV -->
          <button class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1" @click="exporterListe">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            CSV
          </button>
        </div>

        <!-- Stats bar -->
        <div class="row g-3 mb-4">
          <div class="col-3 text-center">
            <div class="stat-pill stat-pill--green">
              <span class="stat-pill__num">{{ affectations.filter(a=>a.encadrant_id).length }}</span>
              <span class="stat-pill__lbl">Affectés</span>
            </div>
          </div>
          <div class="col-3 text-center">
            <div class="stat-pill stat-pill--orange">
              <span class="stat-pill__num">{{ affectations.filter(a=>!a.encadrant_id).length }}</span>
              <span class="stat-pill__lbl">En attente</span>
            </div>
          </div>
          <div class="col-3 text-center">
            <div class="stat-pill stat-pill--blue">
              <span class="stat-pill__num">{{ new Set(affectations.map(a=>a.encadrant_id).filter(Boolean)).size }}</span>
              <span class="stat-pill__lbl">Encadrants</span>
            </div>
          </div>
          <div class="col-3 text-center">
            <div class="stat-pill" style="background:var(--vld-surface-alt);border:1.5px solid var(--vld-border)">
              <span class="stat-pill__num" style="color:var(--vld-primary)">{{ affectations.length }}</span>
              <span class="stat-pill__lbl">Total</span>
            </div>
          </div>
        </div>

        <!-- Consultation table -->
        <div class="table-responsive">
          <table class="table table-hover mb-0" style="font-size:13.5px">
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Matricule</th>
                <th>Encadrant assigné</th>
                <th>Statut</th>
                <th style="width:80px">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!consultFiltered.length">
                <td colspan="6" class="text-center py-4" style="color:var(--vld-text-muted)">Aucun résultat pour ces filtres.</td>
              </tr>
              <tr v-for="aff in consultFiltered" :key="aff.etudiant_id">
                <td>
                  <div class="fw-semibold">{{ aff.etudiant }}</div>
                </td>
                <td style="color:var(--vld-text-muted)">{{ aff.matricule||'—' }}</td>
                <td>
                  <span v-if="aff.encadrant">{{ aff.encadrant }}</span>
                  <span v-else style="color:var(--vld-text-muted);font-style:italic">Non affecté</span>
                </td>
                <td>
                  <span class="badge" :class="aff.encadrant_id ? 'bg-success' : 'bg-warning text-dark'">
                    {{ aff.encadrant_id ? 'Affecté' : 'En attente' }}
                  </span>
                </td>
                <td>
                  <button class="vld-icon-btn" @click="ouvrirEditionAffectation(aff)" title="Modifier l'encadrant">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Action bar -->
        <div class="d-flex justify-content-between align-items-center gap-2 pt-3 border-top mt-3 flex-wrap">
          <button class="btn btn-outline-danger d-flex align-items-center gap-2" @click="confirmerReinit">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.85"/></svg>
            Réinitialiser
          </button>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-secondary" @click="etape='validation'">Retour validation</button>
            <button class="btn btn-success d-flex align-items-center gap-2" @click="diffuser" :disabled="saving">
              <span v-if="saving" class="vld-spinner-sm"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 2 11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              {{ saving ? 'Diffusion...' : diffuse ? 'Re-diffuser' : 'Diffuser' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════════════════════════════
         MODAL : Modifier une affectation individuelle
    ════════════════════════════════════════════════════════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="showEditModal" class="modal-overlay" @click.self="fermerEdition">
        <div class="card p-4" style="max-width:520px;width:100%">
          <!-- Header -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0" style="font-size:15px">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--vld-primary)" stroke-width="2" class="me-2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Modifier l'affectation
            </h5>
            <button class="btn-close" @click="fermerEdition"></button>
          </div>

          <!-- Student info -->
          <div class="p-3 rounded mb-3" style="background:var(--vld-surface-alt);border:1.5px solid var(--vld-border)">
            <div class="d-flex gap-3">
              <div>
                <div class="fw-bold" style="font-size:14px">{{ editAff?.etudiant }}</div>
                <div style="font-size:12px;color:var(--vld-text-muted)">Matricule : {{ editAff?.matricule||'—' }}</div>
                <div style="font-size:12px;color:var(--vld-text-muted)">Spécialité : {{ editAff?.specialite||'—' }}</div>
              </div>
            </div>
          </div>

          <!-- Encadrant actuel -->
          <div class="mb-3">
            <div style="font-size:12px;color:var(--vld-text-muted);margin-bottom:4px">Encadrant actuel</div>
            <div class="fw-semibold" style="font-size:13.5px">
              <span v-if="editAff?.encadrant" class="badge bg-success">{{ editAff.encadrant }}</span>
              <span v-else class="badge bg-warning text-dark">Non affecté</span>
            </div>
          </div>

          <!-- Sélection nouvel encadrant -->
          <div class="mb-4">
            <label class="form-label" style="font-size:13px;font-weight:600">Nouvel encadrant</label>
            <select v-model="editEncadrantId" class="form-select">
              <option :value="null">— Retirer l'encadrant —</option>
              <optgroup label="Encadrants disponibles">
                <option v-for="enc in encadrantsDispoEdit" :key="enc.id" :value="enc.id">
                  {{ enc.nom_complet }}
                </option>
              </optgroup>
              <optgroup label="Encadrants indisponibles" v-if="encadrantsIndispoEdit.length">
                <option v-for="enc in encadrantsIndispoEdit" :key="enc.id" :value="enc.id" disabled>
                  {{ enc.nom_complet }}
                </option>
              </optgroup>
            </select>
            <div v-if="editEncadrantId" class="mt-2" style="font-size:12px;color:var(--vld-text-muted)">
              {{ encadrantEditInfo }}
            </div>
          </div>

          <!-- Raison modification (optionnel) -->
          <div class="mb-4">
            <label class="form-label" style="font-size:13px;font-weight:600">Motif de modification <span style="font-weight:400;color:var(--vld-text-muted)">(optionnel)</span></label>
            <input v-model="editRaison" type="text" class="form-control" placeholder="Ex : demande de l'étudiant, conflit de planning…" />
          </div>

          <!-- Attention si re-diffusion nécessaire -->
          <div v-if="diffuse" class="vld-banner vld-banner--info mb-3">
            <div class="vld-banner__icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
            <div style="font-size:12.5px">La liste est déjà diffusée. Après modification, pensez à <strong>re-diffuser</strong> pour notifier les encadrants.</div>
          </div>

          <div class="d-flex gap-2 justify-content-end">
            <button class="btn btn-outline-secondary" @click="fermerEdition">Annuler</button>
            <button class="btn btn-primary d-flex align-items-center gap-2" @click="enregistrerEdition" :disabled="editSaving">
              <span v-if="editSaving" class="vld-spinner-sm"></span>
              Enregistrer la modification
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ════════════════════════════════════════════════════════════════════════
         MODAL : Confirmation réinitialisation
    ════════════════════════════════════════════════════════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="showReinitModal" class="modal-overlay" @click.self="showReinitModal=false">
        <div class="card p-4" style="max-width:460px;width:100%">
          <h5 class="text-danger fw-bold mb-3">⚠️ Réinitialiser les affectations</h5>
          <p style="font-size:14px;color:var(--vld-text);line-height:1.6" class="mb-4">
            Cette action va <strong>supprimer toutes les affectations</strong> et annuler la diffusion.
            Les étudiants et encadrants ne verront plus les résultats.
          </p>
          <div class="d-flex gap-2 justify-content-end">
            <button class="btn btn-outline-secondary" @click="showReinitModal=false">Annuler</button>
            <button class="btn btn-danger d-flex align-items-center gap-2" @click="reinitialiserTotal" :disabled="reinitEnCours">
              <span v-if="reinitEnCours" class="vld-spinner-sm"></span>
              Oui, réinitialiser
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import api from '@/services/api.js'
import { h } from 'vue'

// ── Inline sub-component ─────────────────────────────────────────────────────
// Uses a render function instead of a template string so it works with
// Vue's runtime-only build (no runtime compiler needed).
const AffectationsTable = {
  name: 'AffectationsTable',
  emits: ['update-nom', 'retirer'],
  props: { affectations: Array, encadrants: Array, editable: Boolean },
  setup (props, { emit }) {

    // SVG cross icon reused in the "retirer" button
    const iconX = () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg', width: 12, height: 12,
      viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2,
    }, [
      h('line', { x1: 18, y1: 6, x2: 6, y2: 18 }),
      h('line', { x1: 6, y1: 6, x2: 18, y2: 18 }),
    ])

    return () => {
      const headerCells = [
        h('th', 'Étudiant'),
        h('th', 'Encadrant assigné'),
        h('th', 'Statut'),
        ...(props.editable ? [h('th')] : []),
      ]

      const rows = props.affectations.map((aff, i) => {
        // Encadrant cell
        let encadrantCell
        if (props.editable) {
          const options = [
            h('option', { value: null }, '— Non affecté —'),
            ...(props.encadrants || []).map(enc => {
              const label =
                enc.nom_complet
              return h('option', { key: enc.id, value: enc.id, disabled: enc.disponibilite === 'non' }, label)
            }),
          ]
          encadrantCell = h('td', [
            h('select', {
              class: 'form-select form-select-sm',
              value: aff.encadrant_id,
              onChange (e) {
                aff.encadrant_id = e.target.value === 'null' ? null : Number(e.target.value) || null
                emit('update-nom', aff)
              },
            }, options),
          ])
        } else {
          encadrantCell = h('td', aff.encadrant || '—')
        }

        const cells = [
          h('td', [
            h('div', { class: 'fw-semibold' }, aff.etudiant),
            h('div', { style: 'font-size:12px;color:#8a9aaa' }, aff.matricule),
          ]),
          encadrantCell,
          h('td', [
            h('span', {
              class: ['badge', aff.encadrant_id ? 'bg-success' : 'bg-warning text-dark'],
            }, aff.encadrant_id ? 'Affecté' : 'En attente'),
          ]),
          ...(props.editable ? [
            h('td', [
              h('button', {
                class: 'vld-icon-btn vld-icon-btn--del',
                onClick () { emit('retirer', i) },
              }, [iconX()]),
            ]),
          ] : []),
        ]

        return h('tr', { key: i }, cells)
      })

      return h('div', { class: 'table-responsive' }, [
        h('table', { class: 'table table-hover mb-0' }, [
          h('thead', [h('tr', headerCells)]),
          h('tbody', rows),
        ]),
      ])
    }
  },
}

// ── Constraint type metadata ─────────────────────────────────────────────────
const CONTRAINTE_TYPES = {
  exclure_encadrant: { label: 'Exclure encadrant', badge: 'bg-danger' },
  exclure_paire:     { label: 'Exclure paire',     badge: 'bg-warning text-dark' },
  forcer_paire:      { label: 'Forcer paire',       badge: 'bg-success' },
  cap_override:      { label: 'Cap. modifiée',      badge: 'bg-info text-dark' },
}

export default {
  name: 'GestionAffectations',
  components: { AffectationsTable },
  emits: ['reinit'],

  data () {
    return {
      etape: 'mode',
      etapes: [
        { key: 'mode',        label: 'Mode' },
        { key: 'contraintes', label: 'Contraintes' },
        { key: 'affectation', label: 'Affectation' },
        { key: 'validation',  label: 'Validation' },
      ],
      modeChoisi: '',
      modes: [
        { key: 'manuel',    icon: '🤝', nom: 'Accord mutuel enseignant / étudiant', desc: "L'étudiant choisit son encadrant parmi les disponibles." },
        { key: 'aleatoire', icon: '🎲', nom: 'Affectation automatique',             desc: 'Distribution automatique selon contraintes.' },
        { key: 'semi',      icon: '⚡', nom: 'Semi-automatique',                    desc: 'Pré-remplissage + ajustement manuel.' },
      ],

      // ── Data ─────────────────────────────────────────────────────────────
      encadrants:     [],
      etudiants:      [],
      affectations:   [],
      nbPreFill:      3,
      totalEtudiants: 0,
      overflowNote:   '',

      // ── Contraintes ───────────────────────────────────────────────────────
      contraintes:            [],
      dateLimite:             '',
      showContrainteForm:     false,
      editingContrainteIndex: null,
      nouvelleContrainte:     { type: 'exclure_encadrant', encadrant_id: null, etudiant_id: null, cap: null, raison: '' },

      // ── Consultation filters ──────────────────────────────────────────────
      consultSearch:          '',
      consultFilterStatut:    '',
      consultFilterEncadrant: '',

      // ── Edition modal ─────────────────────────────────────────────────────
      showEditModal:     false,
      editAff:           null,      // the affectation object being edited
      editEncadrantId:   null,
      editRaison:        '',
      editSaving:        false,

      // ── UI ────────────────────────────────────────────────────────────────
      loading:         false,
      saving:          false,
      diffuse:         false,
      showReinitModal: false,
      reinitEnCours:   false,
      errorMessage:    '',
    }
  },

  computed: {
    etapeIndex () { return this.etapes.findIndex(e => e.key === this.etape) },
    modeLabel ()  { return this.modes.find(m => m.key === this.modeChoisi)?.nom  || '' },
    modeIcon ()   { return this.modes.find(m => m.key === this.modeChoisi)?.icon || '' },
    today ()      { return new Date().toISOString().split('T')[0] },

    encadrantsExclusIds () {
      return new Set(
        this.contraintes
          .filter(c => c.type === 'exclure_encadrant')
          .map(c => c.encadrant_id)
      )
    },

    encadrantsActifs () {
      return this.encadrants.filter(e =>
        !this.encadrantsExclusIds.has(e.id) && e.disponibilite !== 'non'
      )
    },

    totalSlots () {
      return this.encadrantsActifs.reduce((sum, e) => {
        return sum + Math.max(0, this.effectiveCap(e) - e.nb_affectes)
      }, 0)
    },

    capaciteGap () { return this.totalSlots - this.totalEtudiants },

    contrainteValide () {
      const c = this.nouvelleContrainte
      if (!c.encadrant_id) return false
      if (['exclure_paire', 'forcer_paire'].includes(c.type) && !c.etudiant_id) return false
      if (c.type === 'cap_override' && (c.cap === null || c.cap < 0)) return false
      return true
    },

    // ── Consultation computed ─────────────────────────────────────────────
    consultFiltered () {
      const search  = this.consultSearch.trim().toLowerCase()
      const statut  = this.consultFilterStatut
      const encId   = this.consultFilterEncadrant

      return this.affectations.filter(a => {
        if (search) {
          const hay = `${a.etudiant} ${a.encadrant} ${a.matricule}`.toLowerCase()
          if (!hay.includes(search)) return false
        }
        if (statut === 'affecte'     && !a.encadrant_id) return false
        if (statut === 'non_affecte' &&  a.encadrant_id) return false
        if (encId && a.encadrant_id !== encId) return false
        return true
      })
    },

    // ── Edition modal computed ────────────────────────────────────────────
    encadrantsDispoEdit () {
      return this.encadrants.filter(e => e.disponibilite !== 'non')
    },

    encadrantsIndispoEdit () {
      return this.encadrants.filter(e => e.disponibilite === 'non')
    },

    encadrantEditInfo () {
      if (!this.editEncadrantId) return ''
      const enc = this.encadrants.find(e => e.id === this.editEncadrantId)
      if (!enc) return ''
      const libre = Math.max(0, this.effectiveCap(enc) - enc.nb_affectes)
      return `${enc.nom_complet} — ${enc.nb_affectes} affecté(s) sur ${this.effectiveCap(enc)} max — ${libre} place(s) libre(s)`
    },
  },

  async created () { await this.initData() },

  methods: {
    handleError (e, message = 'Une erreur est survenue. Veuillez réessayer.') {
      console.error(e)
      this.errorMessage = message
    },

    async initData () {
      await this.loadEncadrants()
      await this.loadAffectations()
      await this.loadContraintes()
      await this.loadEtudiants()   // always load so the capacity summary shows on contraintes
    },

    async loadContraintes () {
      try {
        const r = await api.get('/affectations/contraintes')
        this.contraintes = Array.isArray(r.data?.contraintes) ? r.data.contraintes : (Array.isArray(r.data) ? r.data : [])
        this.dateLimite  = r.data?.date_limite || ''
      } catch (e) {
        console.error('Could not load contraintes', e)
      }
    },

    async loadEncadrants () {
      try {
        const r = await api.get('/affectations/encadrants-disponibles')
        this.encadrants = (r.data || []).map(e => ({
          id:            e.id,
          nom:           e.nom,
          prenom:        e.prenom,
          nom_complet:   e.nom_complet,
          email:         e.email         ?? null,
          telephone:     e.telephone     ?? null,
          domaine:       e.domaine       ?? null,   // ← domaine_expertise from DB
          specialite:    e.specialite    ?? null,
          nb_affectes:   e.nb_affectes,
          capacite:      e.capacite      ?? 5,
          disponible:    e.disponible,
          disponibilite: e.disponibilite ?? 'oui',
          themes:        e.themes        ?? null,
          encadrement:   e.encadrement   ?? null,
          cotutelle:     e.cotutelle     ?? false,
          commentaire:   e.commentaire   ?? null,   // ← commentaire du voeu
        }))
      } catch (e) {
        this.handleError(e, 'Impossible de charger la liste des encadrants.')
      }
    },

    async loadEtudiants () {
      if (this.etudiants.length) return
      try {
        const r = await api.get('/affectations/etudiants-de-ma-specialite')
        this.etudiants      = r.data || []
        this.totalEtudiants = this.etudiants.length
      } catch (e) {
        this.handleError(e, 'Impossible de charger la liste des étudiants.')
      }
    },

    async loadAffectations () {
      try {
        const modeRes   = await api.get('/affectations/mode').catch(() => ({ data: { mode: null } }))
        const savedMode = modeRes.data?.mode
        if (savedMode) this.modeChoisi = savedMode

        const res  = await api.get('/affectations')
        const data = Array.isArray(res.data) ? res.data : []

        if (data.length) {
          this.affectations = data.map(a => ({
            id:           a.id,
            etudiant_id:  a.etudiant_id,
            etudiant:     a.etudiant,
            matricule:    a.matricule   || '',
            specialite:   a.specialite  || '',
            encadrant_id: a.encadrant_id,
            encadrant:    a.encadrant   || '',
          }))
          if (!this.modeChoisi) this.modeChoisi = data[0]?.mode || ''

          if (data.every(a => a.statut === 'diffusee')) {
            this.diffuse = true
            this.etape   = 'validation'
          } else {
            this.etape = 'affectation'
          }
        } else if (savedMode) {
          // FIX: Only redirect to 'contraintes' on initial load (etape === 'mode').
          // If we are already on 'affectation' or beyond (after lancerAffectation
          // populated in-memory affectations not yet saved to DB), do NOT reset the
          // step — that would wipe the freshly generated list from view.
          if (this.etape === 'mode') {
            this.etape = 'contraintes'
          }
        }
      } catch (e) {
        this.handleError(e, 'Impossible de charger les affectations.')
      }
    },

    // ── Step navigation ───────────────────────────────────────────────────
    async confirmerMode () {
      try {
        await api.post('/affectations/save-mode', { mode: this.modeChoisi })
        // Notify all students and encadrants about the chosen mode
        await api.post('/affectations/notifier-mode', { mode: this.modeChoisi })
        await this.loadEtudiants()
        this.etape = 'contraintes'
      } catch (e) {
        this.handleError(e, 'Impossible d\'enregistrer le mode. Veuillez réessayer.')
      }
    },

    async retourVersMode () {
      if (this.modeChoisi) {
        try { await api.post('/affectations/save-mode', { mode: this.modeChoisi }) }
        catch (e) { console.error(e) }
      }
      this.etape = 'mode'
    },

    async allerAffectation () {
      try {
        if (this.contraintes.length > 0 || (this.modeChoisi === 'manuel' && this.dateLimite)) {
          await api.post('/affectations/contraintes', {
            contraintes: this.contraintes,
            date_limite: this.modeChoisi === 'manuel' ? (this.dateLimite || null) : null,
          })
        }
      } catch (e) {
        this.handleError(e, 'Impossible d\'enregistrer les contraintes. Veuillez réessayer.')
        return
      }
      this.etape = 'affectation'
      if (this.modeChoisi === 'manuel') await this.chargerDemandesAcceptees()
    },

    async chargerDemandesAcceptees () {
      this.loading = true
      try {
        const res       = await api.get('/demandes-encadrement')
        const acceptees = (Array.isArray(res.data) ? res.data : []).filter(d => d.statut === 'acceptee')
        this.affectations = acceptees.map(d => ({
          etudiant_id:  d.etudiant_id,
          etudiant:     d.etudiant,
          matricule:    d.matricule  || '',
          specialite:   d.specialite || '',
          encadrant_id: d.encadrant_id,
          encadrant:    d.encadrant  || '',
        }))
      } catch (e) {
        this.handleError(e, 'Impossible de charger les demandes acceptées.')
      } finally { this.loading = false }
    },

    // ── Contrainte helpers ────────────────────────────────────────────────
    typeLabel (type)      { return CONTRAINTE_TYPES[type]?.label || type },
    typeBadgeClass (type) { return CONTRAINTE_TYPES[type]?.badge || 'bg-secondary' },
    nomEncadrant (id)     { return this.encadrants.find(e => e.id === id)?.nom_complet || `#${id}` },
    nomEtudiant  (id)     { const et = this.etudiants.find(e => e.id === id); return et ? `${et.prenom} ${et.nom}` : `#${id}` },

    capOverrideFor (encId) {
      return this.contraintes.find(c => c.type === 'cap_override' && c.encadrant_id === encId) ?? null
    },

    effectiveCap (enc) {
      const override = this.capOverrideFor(enc.id)
      return override ? override.cap : enc.capacite
    },

    // ── Contrainte CRUD ───────────────────────────────────────────────────
    ouvrirFormContrainte (index) {
      this.editingContrainteIndex = index
      this.nouvelleContrainte = index !== null
        ? { ...this.contraintes[index] }
        : { type: 'exclure_encadrant', encadrant_id: null, etudiant_id: null, cap: null, raison: '' }
      this.showContrainteForm = true
    },

    resetContrainteFields () {
      this.nouvelleContrainte.encadrant_id = null
      this.nouvelleContrainte.etudiant_id  = null
      this.nouvelleContrainte.cap          = null
    },

    enregistrerContrainte () {
      if (!this.contrainteValide) return
      if (this.nouvelleContrainte.type === 'cap_override') {
        const existingIdx = this.contraintes.findIndex(c =>
          c.type === 'cap_override' && c.encadrant_id === this.nouvelleContrainte.encadrant_id
        )
        if (existingIdx !== -1 && existingIdx !== this.editingContrainteIndex) {
          this.contraintes.splice(existingIdx, 1)
        }
      }
      const c = { ...this.nouvelleContrainte }
      if (this.editingContrainteIndex !== null) {
        this.contraintes.splice(this.editingContrainteIndex, 1, c)
      } else {
        this.contraintes.push(c)
      }
      this.annulerContrainte()
    },

    annulerContrainte () {
      this.showContrainteForm     = false
      this.editingContrainteIndex = null
      this.nouvelleContrainte     = { type: 'exclure_encadrant', encadrant_id: null, etudiant_id: null, cap: null, raison: '' }
    },

    supprimerContrainte (i) { this.contraintes.splice(i, 1) },

    // ── Édition individuelle d'une affectation ────────────────────────────
    ouvrirEditionAffectation (aff) {
      this.editAff         = { ...aff }
      this.editEncadrantId = aff.encadrant_id ?? null
      this.editRaison      = ''
      this.showEditModal   = true
    },

    fermerEdition () {
      this.showEditModal   = false
      this.editAff         = null
      this.editEncadrantId = null
      this.editRaison      = ''
    },

    async enregistrerEdition () {
      if (!this.editAff) return
      this.editSaving = true
      this.errorMessage = ''
      try {
        // Persist change via batch endpoint (single row)
        await api.post('/affectations/batch', {
          mode: this.modeChoisi,
          affectations: [{
            etudiant_id:  this.editAff.etudiant_id,
            encadrant_id: this.editEncadrantId || null,
          }],
        })

        // Update local state immediately for snappy UX
        const idx = this.affectations.findIndex(a => a.etudiant_id === this.editAff.etudiant_id)
        if (idx !== -1) {
          const enc = this.encadrants.find(e => e.id === this.editEncadrantId)
          this.affectations[idx].encadrant_id = this.editEncadrantId || null
          this.affectations[idx].encadrant    = enc ? enc.nom_complet : ''
        }

        this.fermerEdition()
        await this.loadEncadrants()   // refresh nb_affectes counters
      } catch (e) {
        this.handleError(e, 'Impossible d\'enregistrer la modification.')
      } finally {
        this.editSaving = false
      }
    },

    // ── Algorithm ─────────────────────────────────────────────────────────
    async lancerAffectation () {
      this.loading      = true
      this.overflowNote = ''
      try {
        if (!this.etudiants.length) await this.loadEtudiants()
        const etudiants = this.etudiants
        this.totalEtudiants = etudiants.length

        const disponibles = this.encadrantsActifs.slice()
        if (!disponibles.length) {
          this.errorMessage = 'Aucun encadrant disponible. Vérifiez les contraintes et les capacités.'
          return   // ← loading is reset in the finally block below
        }

        const forcedPairs       = this.contraintes.filter(c => c.type === 'forcer_paire')
        const lockedEtudiantIds = new Set(forcedPairs.map(c => c.etudiant_id))
        const lockedResult      = {}
        forcedPairs.forEach(c => {
          const enc = this.encadrants.find(e => e.id === c.encadrant_id)
          if (enc) lockedResult[c.etudiant_id] = { encadrant_id: enc.id, encadrant: enc.nom_complet }
        })

        const limit         = this.modeChoisi === 'semi'
          ? Math.min(this.nbPreFill, etudiants.length)
          : etudiants.length
        const freeEtudiants = etudiants.filter((e, i) => i < limit && !lockedEtudiantIds.has(e.id))
        const isOverflow    = this.capaciteGap < 0

        const pairExclusions = new Set(
          this.contraintes
            .filter(c => c.type === 'exclure_paire')
            .map(c => `${c.encadrant_id}-${c.etudiant_id}`)
        )

        const buildBudget = (encs, count) => {
          const budget = {}
          if (!isOverflow) {
            encs.forEach(e => { budget[e.id] = Math.max(0, this.effectiveCap(e) - e.nb_affectes) })
          } else {
            const share = Math.ceil(count / encs.length)
            encs.forEach(e => { budget[e.id] = share })
          }
          return budget
        }

        const budget    = buildBudget(disponibles, freeEtudiants.length)
        const slotsUsed = {}
        let pointer     = 0

        const freeResults = freeEtudiants.map(et => {
          let encadrant_id = null, encadrant_name = ''
          let tried = 0
          while (tried < disponibles.length) {
            const enc    = disponibles[pointer % disponibles.length]
            slotsUsed[enc.id] = slotsUsed[enc.id] || 0
            const pairKey  = `${enc.id}-${et.id}`
            const maxSlots = budget[enc.id] ?? 0
            if (slotsUsed[enc.id] < maxSlots && !pairExclusions.has(pairKey)) {
              encadrant_id   = enc.id
              encadrant_name = enc.nom_complet
              slotsUsed[enc.id]++
              pointer++
              break
            }
            pointer++
            tried++
          }
          return { id: et.id, encadrant_id, encadrant_name }
        })

        this.affectations = etudiants.map((et, i) => {
          if (lockedResult[et.id]) {
            return { etudiant_id: et.id, etudiant: `${et.prenom} ${et.nom}`, matricule: et.matricule||'', specialite: et.specialite||'', encadrant_id: lockedResult[et.id].encadrant_id, encadrant: lockedResult[et.id].encadrant }
          }
          if (i >= limit) {
            return { etudiant_id: et.id, etudiant: `${et.prenom} ${et.nom}`, matricule: et.matricule||'', specialite: et.specialite||'', encadrant_id: null, encadrant: '' }
          }
          const r = freeResults.find(fr => fr.id === et.id)
          return { etudiant_id: et.id, etudiant: `${et.prenom} ${et.nom}`, matricule: et.matricule||'', specialite: et.specialite||'', encadrant_id: r?.encadrant_id??null, encadrant: r?.encadrant_name??'' }
        })

        if (isOverflow) {
          const surplus = Math.abs(this.capaciteGap)
          this.overflowNote = `Note : La capacité totale déclarée (${this.totalSlots} place(s)) est insuffisante pour les ${this.totalEtudiants} étudiant(s). ${surplus} étudiant(s) ont été répartis au-delà des vœux exprimés.`
        }
      } catch (e) {
        this.handleError(e, "Erreur lors du lancement de l'affectation automatique.")
      } finally { this.loading = false }
    },

    // ── Réinitialisation ──────────────────────────────────────────────────
    async reinitialiser () {
      try {
        await api.delete('/affectations/reinitialiser')
        this.affectations = []
        this.overflowNote = ''
        await this.loadEncadrants()
      } catch (e) { this.handleError(e, 'Erreur lors de la réinitialisation.') }
    },

    confirmerReinit () { this.showReinitModal = true },

    async reinitialiserTotal () {
      this.reinitEnCours = true
      try {
        // Single endpoint — now also purges demandes on the backend
        await api.delete('/affectations/reinitialiser')
        this.affectations    = []
        this.contraintes     = []
        this.diffuse         = false
        this.modeChoisi      = ''
        this.overflowNote    = ''
        this.etape           = 'mode'
        this.showReinitModal = false
        // Notify the parent dashboard so it can reset maDemande + EncadrantsDisponibles
        this.$emit('reinit')
      } catch (e) {
        this.handleError(e, 'Erreur lors de la réinitialisation totale.')
      } finally { this.reinitEnCours = false }
    },

    // ── Helpers (table inline edit) ───────────────────────────────────────
    retirerAffectation (i) {
      this.affectations[i].encadrant    = ''
      this.affectations[i].encadrant_id = null
    },

    updateEncadrantNom (aff) {
      const enc     = this.encadrants.find(e => e.id === aff.encadrant_id)
      aff.encadrant = enc ? enc.nom_complet : ''
    },

    // ── Diffusion ─────────────────────────────────────────────────────────
    async diffuser () {
      this.saving       = true
      this.errorMessage = ''
      try {
        if (this.modeChoisi !== 'manuel' && this.affectations.length) {
          await api.post('/affectations/batch', {
            mode:         this.modeChoisi,
            affectations: this.affectations.map(a => ({
              etudiant_id:  a.etudiant_id,
              encadrant_id: a.encadrant_id || null,
            })),
          })
        }
        await api.post('/affectations/diffuser')
        this.diffuse = true
        await this.loadAffectations()
        // After (re-)diffusion, always land on the validation recap step
        if (this.etape === 'consultation') this.etape = 'validation'
      } catch (e) {
        this.handleError(e, 'La diffusion a échoué. Vérifiez les affectations et réessayez.')
      } finally { this.saving = false }
    },

    // ── Export CSV ────────────────────────────────────────────────────────
    exporterListe () {
      const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`
      const source = this.etape === 'consultation' ? this.consultFiltered : this.affectations
      const rows   = source.map(a =>
        [a.etudiant, a.matricule, a.specialite, a.encadrant || '—'].map(escape).join(',')
      )
      const lines = ['Étudiant,Matricule,Spécialité,Encadrant', ...rows]
      if (this.overflowNote) lines.push(`\n${escape(this.overflowNote)}`)
      const csv = lines.join('\n')
      const a   = document.createElement('a')
      a.href     = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }))
      a.download = 'affectations.csv'
      a.click()
    },
  },
}
</script>

<style scoped>
/* ── Stepper ────────────────────────────────────────────────────────────────── */
.stepper-num    { width:30px;height:30px;border-radius:50%;background:var(--vld-surface-alt);border:2px solid var(--vld-border);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--vld-text-muted);flex-shrink:0; }
.stepper-active { background:var(--vld-primary)!important;border-color:var(--vld-primary)!important;color:#fff!important; }
.stepper-done   { background:#27ae60!important;border-color:#27ae60!important;color:#fff!important; }
.stepper-lbl    { font-size:13px;font-weight:600;color:var(--vld-text-muted);white-space:nowrap; }
.stepper-line   { width:40px;height:2px;background:var(--vld-border);margin:0 8px;flex-shrink:0; }

/* ── Mode cards ─────────────────────────────────────────────────────────────── */
.mode-card      { position:relative;padding:20px;background:var(--vld-surface-alt);border:2px solid var(--vld-border);border-radius:var(--vld-r-xl);cursor:pointer;transition:border-color var(--vld-t-base);height:100%; }
.mode-card:hover{ border-color:var(--vld-primary); }
.mode-selected  { border-color:var(--vld-primary)!important;background:rgba(61,96,128,.07)!important; }
.mode-check     { position:absolute;top:12px;right:12px; }

/* ── Modal ──────────────────────────────────────────────────────────────────── */
.modal-overlay  { position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px; }

/* ── Constraints sections ───────────────────────────────────────────────────── */
.contraintes-section { border:1.5px solid var(--vld-border);border-radius:var(--vld-r-xl);overflow:hidden; }
.contraintes-section + .contraintes-section { margin-top:16px; }
.contraintes-section__header { padding:10px 16px;background:var(--vld-surface-alt);font-size:13.5px;font-weight:600;color:var(--vld-text-strong);display:flex;align-items:center;gap:8px;border-bottom:1.5px solid var(--vld-border); }
.contrainte-form { padding:14px 16px;background:rgba(61,96,128,.04);border-bottom:1.5px solid var(--vld-border); }

/* ── Stat pills (consultation) ──────────────────────────────────────────────── */
.stat-pill          { display:flex;flex-direction:column;align-items:center;padding:12px 8px;border-radius:10px; }
.stat-pill--green   { background:rgba(39,174,96,.08);border:1.5px solid rgba(39,174,96,.25); }
.stat-pill--orange  { background:rgba(230,126,34,.08);border:1.5px solid rgba(230,126,34,.25); }
.stat-pill--blue    { background:rgba(61,96,128,.08);border:1.5px solid var(--vld-border); }
.stat-pill__num     { font-size:26px;font-weight:700;line-height:1.1; }
.stat-pill--green   .stat-pill__num { color:#27ae60; }
.stat-pill--orange  .stat-pill__num { color:#e67e22; }
.stat-pill--blue    .stat-pill__num { color:var(--vld-primary); }
.stat-pill__lbl     { font-size:11.5px;color:var(--vld-text-muted);margin-top:3px; }

/* ── Modal fade transition ──────────────────────────────────────────────────── */
.modal-fade-enter-active,.modal-fade-leave-active { transition:opacity .2s ease; }
.modal-fade-enter-from,.modal-fade-leave-to { opacity:0; }

/* ── Cap Summary ───────────────────────────────────────────────────────────────────────────────── */
.cap-summary { border:1.5px solid var(--vld-border);border-radius:var(--vld-r-xl);overflow:hidden;background:var(--vld-surface-alt); }
.cap-summary__header { padding:10px 16px;background:var(--vld-surface-alt);font-size:13px;font-weight:600;color:var(--vld-text-strong);display:flex;align-items:center;gap:8px;border-bottom:1.5px solid var(--vld-border); }
.cap-summary__counts { display:flex;align-items:center;gap:0;padding:16px 20px;flex-wrap:wrap;gap:8px; }
.cap-count { display:flex;flex-direction:column;align-items:center;flex:1;min-width:100px;text-align:center; }
.cap-count__num { font-size:28px;font-weight:700;line-height:1; }
.cap-count__num--blue  { color:#3d6080; }
.cap-count__num--green { color:#27ae60; }
.cap-count__num--red   { color:#e74c3c; }
.cap-count__lbl { font-size:11px;color:var(--vld-text-muted);margin-top:4px;line-height:1.3;max-width:110px; }
.cap-count__sep { font-size:20px;color:var(--vld-border);flex-shrink:0;padding:0 4px; }
.cap-summary__bar-wrap { display:flex;align-items:center;gap:10px;padding:0 20px 14px; }
.cap-summary__bar-track { flex:1;height:7px;background:var(--vld-border);border-radius:99px;overflow:hidden; }
.cap-summary__bar-fill { height:100%;border-radius:99px;transition:width .4s ease,background .3s ease; }
.cap-summary__bar-pct { font-size:12px;font-weight:700;flex-shrink:0;min-width:36px;text-align:right; }
.cap-summary__alert { display:flex;align-items:flex-start;gap:8px;padding:11px 16px;font-size:13px;line-height:1.55;border-top:1.5px solid var(--vld-border); }
.cap-summary__alert svg { flex-shrink:0;margin-top:2px; }
.cap-summary__alert--danger  { background:rgba(231,76,60,.06);color:#c0392b; }
.cap-summary__alert--warning { background:rgba(243,156,18,.07);color:#9c6d05; }
.cap-summary__alert--ok      { background:rgba(39,174,96,.06);color:#1e8449; }
</style>