import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="btn btn-ghost mb-6">
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Retour à l'accueil
        </Link>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="text-4xl font-bold mb-6">Politique de Confidentialité</h1>
            <p className="text-sm text-base-content/70 mb-8">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-CA')}
            </p>

            <div className="prose max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p className="mb-4">
                  Inventory AI ("nous", "notre", "nos") s'engage à protéger votre vie privée. 
                  Cette politique de confidentialité explique comment nous collectons, utilisons, 
                  divulguons et protégeons vos informations personnelles lorsque vous utilisez 
                  notre service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Informations que nous collectons</h2>
                <h3 className="text-xl font-semibold mb-3">2.1 Informations d'authentification</h3>
                <p className="mb-4">
                  Lorsque vous vous connectez avec Google OAuth, nous collectons :
                </p>
                <ul className="list-disc list-inside mb-4 ml-4">
                  <li>Votre adresse e-mail</li>
                  <li>Votre nom d'affichage</li>
                  <li>Votre photo de profil (si disponible)</li>
                  <li>Un identifiant unique Google</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">2.2 Informations d'inventaire</h3>
                <p className="mb-4">
                  Nous stockons les données que vous créez dans votre inventaire :
                </p>
                <ul className="list-disc list-inside mb-4 ml-4">
                  <li>Images que vous téléversez</li>
                  <li>Descriptions d'articles</li>
                  <li>Valeurs estimées</li>
                  <li>Métadonnées associées</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Comment nous utilisons vos informations</h2>
                <p className="mb-4">Nous utilisons vos informations pour :</p>
                <ul className="list-disc list-inside mb-4 ml-4">
                  <li>Fournir et améliorer nos services</li>
                  <li>Traiter vos inventaires avec l'intelligence artificielle</li>
                  <li>Vous authentifier et sécuriser votre compte</li>
                  <li>Vous contacter concernant votre compte ou nos services</li>
                  <li>Respecter nos obligations légales</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Partage d'informations</h2>
                <p className="mb-4">
                  Nous ne vendons, ne louons ni ne partageons vos informations personnelles avec 
                  des tiers, sauf dans les cas suivants :
                </p>
                <ul className="list-disc list-inside mb-4 ml-4">
                  <li>
                    <strong>Fournisseurs de services :</strong> Nous utilisons des services tiers 
                    (comme Google OAuth, OpenAI pour l'analyse d'images) qui peuvent avoir accès à 
                    certaines informations dans le cadre de leurs services.
                  </li>
                  <li>
                    <strong>Obligations légales :</strong> Nous pouvons divulguer vos informations 
                    si la loi l'exige ou pour protéger nos droits.
                  </li>
                  <li>
                    <strong>Avec votre consentement :</strong> Nous partagerons vos informations 
                    uniquement avec votre consentement explicite.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Sécurité des données</h2>
                <p className="mb-4">
                  Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos 
                  informations contre l'accès non autorisé, la modification, la divulgation ou 
                  la destruction. Cependant, aucune méthode de transmission sur Internet n'est 
                  totalement sécurisée.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Vos droits</h2>
                <p className="mb-4">Vous avez le droit de :</p>
                <ul className="list-disc list-inside mb-4 ml-4">
                  <li>Accéder à vos informations personnelles</li>
                  <li>Corriger des informations inexactes</li>
                  <li>Demander la suppression de vos données</li>
                  <li>Vous opposer au traitement de vos données</li>
                  <li>Demander la portabilité de vos données</li>
                  <li>Retirer votre consentement à tout moment</li>
                </ul>
                <p className="mb-4">
                  Pour exercer ces droits, contactez-nous à l'adresse indiquée dans la section 
                  "Contact" ci-dessous.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Cookies et technologies similaires</h2>
                <p className="mb-4">
                  Nous utilisons des cookies de session pour maintenir votre connexion et améliorer 
                  votre expérience. Ces cookies sont essentiels au fonctionnement du service et ne 
                  peuvent pas être désactivés.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Conservation des données</h2>
                <p className="mb-4">
                  Nous conservons vos informations aussi longtemps que nécessaire pour fournir nos 
                  services ou selon les exigences légales. Vous pouvez demander la suppression de 
                  votre compte et de vos données à tout moment.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">9. Modifications de cette politique</h2>
                <p className="mb-4">
                  Nous pouvons modifier cette politique de confidentialité de temps à autre. 
                  Nous vous informerons de tout changement en publiant la nouvelle politique sur 
                  cette page et en mettant à jour la date de "Dernière mise à jour".
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
                <p className="mb-4">
                  Si vous avez des questions concernant cette politique de confidentialité, 
                  veuillez nous contacter à :
                </p>
                <p className="mb-4">
                  <strong>Email :</strong>{' '}
                  <a href="mailto:info@heliacode.com" className="link link-primary">
                    info@heliacode.com
                  </a>
                </p>
                <p className="mb-4">
                  Pour toute demande d'assistance, consultez notre page{' '}
                  <Link to="/support" className="link link-primary">Support & Contact</Link>.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">11. Conformité RGPD</h2>
                <p className="mb-4">
                  Si vous résidez dans l'Union européenne, vous bénéficiez de droits supplémentaires 
                  en vertu du Règlement Général sur la Protection des Données (RGPD). Cette politique 
                  est conforme aux exigences du RGPD.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
