// services/kpiService.js
// ─────────────────────────────────────────────────────────────────────────────
// Aligned to the three dashboard controllers:
//   ChefDashboardController     → GET /api/dashboard/chef
//   DirecteurDashboardController → GET /api/dashboard/directeur
//   EncadrantDashboardController → GET /api/dashboard/encadrant
//
// USAGE NOTES
// ───────────
// The home dashboard components (DashboardChefHome, DashboardEncadrantHome,
// DashboardDirecteurHome) call the AGGREGATE endpoints (getChefDashboard,
// getEncadrantDashboard, getDirecteurDashboard) which return both kpi + charts
// in a single request.
//
// The individual methods below are kept for granular use-cases (e.g. refreshing
// a single KPI card without reloading the entire dashboard).
//
// ─────────────────────────────────────────────────────────────────────────────

import api from './api'

class KpiService {

  // ══════════════════════════════════════════════════════════════════
  // AGGREGATE ENDPOINTS (one call = kpi + charts)
  // ══════════════════════════════════════════════════════════════════

  /**
   * Full chef dashboard payload.
   * Returns: { kpi, charts: { chargeEncadrants, surchargeEncadrants,
   *   planificationSoutenances, respectCalendrier, respectPhases,
   *   retardParEncadrant } }
   */
  async getChefDashboard() {
    const res = await api.get('/dashboard/chef')
    return res.data
  }

  /**
   * Full directeur dashboard payload.
   * Returns: { kpi, charts: { soutenancesParSpecialite, encadrantsParSpecialite,
   *   etudiantsParSpecialite, tauxReussiteGlobal, soutenancesRealisees,
   *   pfeFinalisesDelais } }
   */
  async getDirecteurDashboard() {
    const res = await api.get('/dashboard/directeur')
    return res.data
  }

  /**
   * Full encadrant dashboard payload.
   * Returns: { kpi, charts: { validationSujets, chargeSuiviEtudiants,
   *   validationRapports, avancementMoyen, pfeEnRetard, tauxReussite } }
   */
  async getEncadrantDashboard() {
    const res = await api.get('/dashboard/encadrant')
    return res.data
  }

  // ══════════════════════════════════════════════════════════════════
  // CHEF — granular helpers (all route to /dashboard/chef internally)
  // ══════════════════════════════════════════════════════════════════

  /**
   * Returns the full chef KPI block.
   * { totalSoutenances, totalEncadrants, chargeMoyenne,
   *   tauxRetard, tauxPlanification, totalEtudiants }
   */
  async getChefKPIs() {
    const data = await this.getChefDashboard()
    return data.kpi
  }

  /** nb de soutenances dans la spécialité du chef */
  async getChefSoutenancesCount() {
    const data = await this.getChefDashboard()
    return data.kpi.totalSoutenances
  }

  /** nb d'encadrants actifs */
  async getChefEncadrantsCount() {
    const data = await this.getChefDashboard()
    return data.kpi.totalEncadrants
  }

  /** charge moyenne par encadrant */
  async getChefChargeMoyenne() {
    const data = await this.getChefDashboard()
    return data.kpi.chargeMoyenne
  }

  /** taux de surcharge (seuil 5 par défaut dans le controller) */
  async getChefTauxSurcharge() {
    const data = await this.getChefDashboard()
    return data.charts.surchargeEncadrants?.tauxSurcharge ?? 0
  }

  /** taux de planification des soutenances */
  async getChefPlanificationSoutenances() {
    const data = await this.getChefDashboard()
    return data.charts.planificationSoutenances
  }

  /** données courbe : respect calendrier par mois */
  async getChefRespectCalendrier() {
    const data = await this.getChefDashboard()
    return data.charts.respectCalendrier
  }

  /** données courbe : respect des phases PFE */
  async getChefRespectPhasesPFE() {
    const data = await this.getChefDashboard()
    return data.charts.respectPhases
  }

  /** taux de retard global */
  async getChefTauxRetard() {
    const data = await this.getChefDashboard()
    return data.kpi.tauxRetard
  }

  /** histogramme : charge par encadrant */
  async getChefChargeEncadrants() {
    const data = await this.getChefDashboard()
    return data.charts.chargeEncadrants
  }

  /** barres : retard par encadrant */
  async getChefRetardParEncadrant() {
    const data = await this.getChefDashboard()
    return data.charts.retardParEncadrant
  }

  // ══════════════════════════════════════════════════════════════════
  // DIRECTEUR — granular helpers
  // ══════════════════════════════════════════════════════════════════

  /**
   * KPI block directeur.
   * { totalSpecialites, totalSoutenances, soutenancesTerminees,
   *   tauxReussite, totalEtudiants, totalEncadrants }
   */
  async getDirecteurKPIs() {
    const data = await this.getDirecteurDashboard()
    return data.kpi
  }

  async getDirecteurSoutenancesParSpecialite() {
    const data = await this.getDirecteurDashboard()
    return data.charts.soutenancesParSpecialite
  }

  async getDirecteurEncadrantsParSpecialite() {
    const data = await this.getDirecteurDashboard()
    return data.charts.encadrantsParSpecialite
  }

  async getDirecteurRepartitionEtudiantsParSpecialite() {
    const data = await this.getDirecteurDashboard()
    return data.charts.etudiantsParSpecialite
  }

  async getDirecteurTauxReussiteGlobal() {
    const data = await this.getDirecteurDashboard()
    return data.charts.tauxReussiteGlobal
  }

  async getDirecteurTauxSoutenancesRealisees() {
    const data = await this.getDirecteurDashboard()
    return data.charts.soutenancesRealisees
  }

  async getDirecteurTauxPFEfinalisesDelais() {
    const data = await this.getDirecteurDashboard()
    return data.charts.pfeFinalisesDelais
  }

  // ══════════════════════════════════════════════════════════════════
  // ENCADRANT — granular helpers
  // ══════════════════════════════════════════════════════════════════

  /**
   * KPI block encadrant.
   * { nbEtudiants, tauxValidation, avancementMoyen,
   *   tauxReussite, reunionsMoyennes, sujetsValides, sujetsTotal }
   */
  async getEncadrantKPIs() {
    const data = await this.getEncadrantDashboard()
    return data.kpi
  }

  async getEncadrantTauxValidationSujets() {
    const data = await this.getEncadrantDashboard()
    return data.charts.validationSujets
  }

  async getEncadrantNbEtudiants() {
    const data = await this.getEncadrantDashboard()
    return data.kpi.nbEtudiants
  }

  async getEncadrantChargeMoyenneSuivi() {
    const data = await this.getEncadrantDashboard()
    return data.charts.chargeSuiviEtudiants
  }

  async getEncadrantTauxValidationRapports() {
    const data = await this.getEncadrantDashboard()
    return data.charts.validationRapports
  }

  async getEncadrantTauxAvancementMoyen() {
    const data = await this.getEncadrantDashboard()
    return data.charts.avancementMoyen
  }

  async getEncadrantTauxPFEenRetard() {
    const data = await this.getEncadrantDashboard()
    return data.charts.pfeEnRetard
  }

  async getEncadrantTauxReussite() {
    const data = await this.getEncadrantDashboard()
    return data.charts.tauxReussite
  }

  // ══════════════════════════════════════════════════════════════════
  // JURY — derived from /jurys-pfe (no dedicated controller endpoint)
  // ══════════════════════════════════════════════════════════════════

  /**
   * Returns jury stats for the currently authenticated user.
   * Filters /jurys-pfe by user membership.
   * { totalProjets, evalues, nonEvalues, noteMoyenne, projets[], notes[] }
   */
  async getJuryStats(userId) {
    const res = await api.get('/jurys-pfe')
    const all = res.data || []

    // Only jurys where I am a member
    const mesProjets = all.filter(j =>
      (j.membres || []).some(m => m.enseignant_id === userId)
    )

    const evalues = mesProjets.filter(j => {
      const m = (j.membres || []).find(m => m.enseignant_id === userId)
      return m && m.note !== null
    })

    const notesData = evalues.map(j => {
      const m = (j.membres || []).find(m => m.enseignant_id === userId)
      return { titre: j.projet_titre || ('Projet #' + j.id), note: m?.note ?? 0 }
    })

    const noteMoyenne = notesData.length > 0
      ? (notesData.reduce((s, n) => s + n.note, 0) / notesData.length).toFixed(1)
      : '—'

    return {
      totalProjets: mesProjets.length,
      evalues:      evalues.length,
      nonEvalues:   mesProjets.length - evalues.length,
      noteMoyenne,
      projets:      notesData.map(n => n.titre),
      notes:        notesData.map(n => n.note),
    }
  }
}

export default new KpiService()