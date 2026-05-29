/**
 * ce fichier protége l’accés aux pages sensibles de l’application(admin)et jout le role d'un guard de navigation
 * utilisé danx index.js (requireadmin)
 * 
 */
export function requireAdmin(to, from, next) { // la déclaration d'une fonction qui peut etre importer/utiliser 
  const raw = localStorage.getItem('user')// recupére les données de l'utilisateur depuis le localStorage 
  if (!raw) { //if aucun user est connecté elle lui redirige ver la page de connexion

    return next('/login')//redirection vers la page de connexion 

  }

  try {
    const user = JSON.parse(raw) //en place les données brute (chaine) de l'utilisateur dans un objet js
    if (user && user.isAdmin === true) { // si l'utilisateur existe et un admin , ===:compare type et valeur :true=true pas'true' ou 1
      
      return next() //autoise l'accés à la page demandé
    } else {
    
      return next('/') //sinon redirection ver la page d'accueil (il est déjà connecté)(le prblm est d'accés par authen)
    }

  } catch { //une erreur se produit exp: JSON.parse() unvalide

    localStorage.removeItem('user') //suprim les données corrompues de local storage
    return next('/login')//redirection vers la page de connexion 
  }
}