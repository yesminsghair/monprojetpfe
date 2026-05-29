import { createApp } from 'vue'// la méthode create app depuis le package  vue cré une instance de l'application
import App from './App.vue' // l'imprt de le composant racine de l'application
import router from './router/index.js'// fichier de routeur pour la navigation

// ── Bootstrap 5 ──────────────────────────────────────────────
// Layout, components (buttons, badges, forms, modals, tables)
import 'bootstrap/dist/css/bootstrap.min.css' //fichier css minifié de bootstrap fournit des styles par défault
import 'bootstrap/dist/js/bootstrap.bundle.min.js'//fichier js minifié permet des interactions dynamiques

// ── Brand tokens ─────────────────────────────────────────────
// Colors, fonts, radius, shadows — overrides Bootstrap defaults
// where the brand differs. Must come AFTER bootstrap.min.css.
import './design-tokens.css' //fichier css des marque 

// ── Laravel Echo (Reverb) ─────────────────────────────────────
// Must be imported BEFORE createApp so that window.Echo is set
// up before any component's setup() / mounted() hook runs.
import './echo.js'

createApp(App).use(router).mount('#app') // la creation d'une instance du composant racine permet la navigation 
// avec router et l'attache au Dom : index.html cherche l'élément avec id:app => 
// mount comme un bouton play ou démarer l'applica