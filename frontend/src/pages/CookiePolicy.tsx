import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="btn btn-ghost mb-6">
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Retour à l'accueil
        </Link>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="text-4xl font-bold mb-6">Politique des Cookies</h1>
            <p className="text-sm text-base-content/70 mb-8">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-CA')}
            </p>

            <div className="prose max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Qu'est-ce qu'un cookie ?</h2>
                <p className="mb-4">
                  Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous 
                  visitez un site web. Les cookies permettent au site web de mémoriser vos actions 
                  et préférences sur une période donnée.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Comment nous utilisons les cookies</h2>
                <p className="mb-4">
                  Inventory AI utilise des cookies pour :
                </p>
                <ul className="list-disc list-inside mb-4 ml-4">
                  <li>
                    <strong>Authentification :</strong> Maintenir votre session de connexion 
                    sécurisée
                  </li>
                  <li>
                    <strong>Fonctionnalité :</strong> Mémoriser vos préférences et améliorer 
                    votre expérience utilisateur
                  </li>
                  <li>
                    <strong>Sécurité :</strong> Protéger contre les activités frauduleuses
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Types de cookies que nous utilisons</h2>
                
                <h3 className="text-xl font-semibold mb-3">3.1 Cookies essentiels</h3>
                <p className="mb-4">
                  Ces cookies sont nécessaires au fonctionnement du Service. Ils incluent les 
                  cookies de session qui maintiennent votre connexion. Sans ces cookies, le 
                  Service ne peut pas fonctionner correctement.
                </p>
                <ul className="list-disc list-inside mb-4 ml-4">
                  <li><strong>session_id :</strong> Maintient votre session de connexion</li>
                  <li><strong>csrf_token :</strong> Protège contre les attaques CSRF</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">3.2 Cookies de performance</h3>
                <p className="mb-4">
                  Ces cookies nous aident à comprendre comment les visiteurs interagissent avec 
                  le Service en collectant des informations anonymes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Cookies tiers</h2>
                <p className="mb-4">
                  Nous utilisons des services tiers qui peuvent placer des cookies sur votre 
                  appareil :
                </p>
                <ul className="list-disc list-inside mb-4 ml-4">
                  <li>
                    <strong>Google OAuth :</strong> Pour l'authentification via Google. 
                    Consultez la politique de confidentialité de Google pour plus d'informations.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Durée de conservation</h2>
                <p className="mb-4">
                  Les cookies de session expirent lorsque vous fermez votre navigateur. 
                  Les cookies persistants peuvent rester sur votre appareil jusqu'à 30 jours 
                  ou jusqu'à ce que vous les supprimiez manuellement.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Gestion des cookies</h2>
                <p className="mb-4">
                  Vous pouvez contrôler et gérer les cookies de plusieurs façons :
                </p>
                <ul className="list-disc list-inside mb-4 ml-4">
                  <li>
                    <strong>Paramètres du navigateur :</strong> La plupart des navigateurs 
                    vous permettent de refuser ou d'accepter les cookies. Consultez les 
                    paramètres de votre navigateur pour plus d'informations.
                  </li>
                  <li>
                    <strong>Impact :</strong> Veuillez noter que la désactivation des cookies 
                    essentiels peut affecter le fonctionnement du Service.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Cookies et appareils mobiles</h2>
                <p className="mb-4">
                  Les appareils mobiles peuvent utiliser des technologies similaires aux cookies, 
                  telles que les identifiants d'appareil. Cette politique s'applique également 
                  à ces technologies.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Modifications de cette politique</h2>
                <p className="mb-4">
                  Nous pouvons modifier cette politique des cookies de temps à autre. 
                  Nous vous informerons de tout changement en publiant la nouvelle politique 
                  sur cette page.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">9. Contact</h2>
                <p className="mb-4">
                  Si vous avez des questions concernant notre utilisation des cookies, 
                  veuillez nous contacter à :
                </p>
                <p className="mb-4">
                  <strong>Email :</strong> privacy@inventoryai.app<br />
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
