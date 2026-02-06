import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Terms() {
  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="mx-auto max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Retour à l'accueil
          </Button>
        </Link>

        <Card className="shadow-xl">
          <CardContent className="p-6">
            <h1 className="mb-6 text-4xl font-bold">Conditions d'Utilisation</h1>
            <p className="mb-8 text-sm text-muted-foreground">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-CA')}
            </p>

            <div className="prose max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Acceptation des conditions</h2>
                <p className="mb-4">
                  En accédant et en utilisant Inventory AI ("le Service"), vous acceptez d'être 
                  lié par ces Conditions d'Utilisation. Si vous n'acceptez pas ces conditions, 
                  veuillez ne pas utiliser le Service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Description du service</h2>
                <p className="mb-4">
                  Inventory AI est un service d'inventaire assisté par intelligence artificielle 
                  qui permet aux utilisateurs de créer, gérer et analyser leurs inventaires en 
                  téléversant des images. Le Service utilise l'IA pour identifier et évaluer 
                  automatiquement les articles dans vos images.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Compte utilisateur</h2>
                <h3 className="text-xl font-semibold mb-3">3.1 Création de compte</h3>
                <p className="mb-4">
                  Pour utiliser le Service, vous devez créer un compte en vous connectant via 
                  Google OAuth ou en utilisant un nom d'utilisateur et un mot de passe.
                </p>

                <h3 className="text-xl font-semibold mb-3">3.2 Responsabilités du compte</h3>
                <p className="mb-4">Vous êtes responsable de :</p>
                <ul className="list-disc list-inside mb-4 ml-4">
                  <li>Maintenir la confidentialité de vos identifiants de connexion</li>
                  <li>Toutes les activités qui se produisent sous votre compte</li>
                  <li>Nous informer immédiatement de tout accès non autorisé</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Utilisation acceptable</h2>
                <p className="mb-4">Vous acceptez de ne pas :</p>
                <ul className="list-disc list-inside mb-4 ml-4">
                  <li>Utiliser le Service à des fins illégales ou non autorisées</li>
                  <li>Violer les lois locales, étatiques, nationales ou internationales</li>
                  <li>Transmettre des virus, vers ou tout code malveillant</li>
                  <li>Tenter d'accéder non autorisé à d'autres comptes ou systèmes</li>
                  <li>Utiliser le Service pour harceler, abuser ou nuire à autrui</li>
                  <li>Reproduire, dupliquer ou copier le Service sans autorisation</li>
                  <li>Téléverser du contenu offensant, diffamatoire ou illégal</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Contenu utilisateur</h2>
                <h3 className="text-xl font-semibold mb-3">5.1 Vos droits</h3>
                <p className="mb-4">
                  Vous conservez tous les droits sur le contenu que vous téléversez sur le Service. 
                  En téléversant du contenu, vous nous accordez une licence non exclusive, 
                  mondiale et gratuite pour utiliser, stocker et traiter ce contenu dans le but 
                  de fournir le Service.
                </p>

                <h3 className="text-xl font-semibold mb-3">5.2 Responsabilité du contenu</h3>
                <p className="mb-4">
                  Vous êtes seul responsable du contenu que vous téléversez. Vous garantissez que 
                  vous avez tous les droits nécessaires sur le contenu et que son utilisation ne 
                  viole aucun droit de tiers.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Propriété intellectuelle</h2>
                <p className="mb-4">
                  Le Service et son contenu original, ses fonctionnalités et sa fonctionnalité 
                  sont et resteront la propriété exclusive d'Inventory AI et de ses concédants de 
                  licence. Le Service est protégé par les lois sur le droit d'auteur, les marques 
                  de commerce et autres lois.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Limitation de responsabilité</h2>
                <p className="mb-4">
                  LE SERVICE EST FOURNI "EN L'ÉTAT" ET "SELON DISPONIBILITÉ". NOUS NE GARANTISSONS 
                  PAS QUE LE SERVICE SERA ININTERROMPU, SÉCURISÉ OU EXEMPT D'ERREURS. NOUS NE 
                  SOMMES PAS RESPONSABLES DES DOMMAGES INDIRECTS, ACCESSOIRES, SPÉCIAUX OU 
                  CONSÉCUTIFS RÉSULTANT DE VOTRE UTILISATION DU SERVICE.
                </p>
                <p className="mb-4">
                  Les estimations de valeur fournies par le Service sont à titre indicatif uniquement 
                  et ne doivent pas être considérées comme des évaluations professionnelles. 
                  Nous ne garantissons pas l'exactitude de ces estimations.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Indemnisation</h2>
                <p className="mb-4">
                  Vous acceptez d'indemniser et de dégager Inventory AI de toute responsabilité 
                  concernant toute réclamation, perte, responsabilité, dommage, coût ou dépense 
                  résultant de votre utilisation du Service ou de votre violation de ces Conditions 
                  d'Utilisation.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">9. Résiliation</h2>
                <p className="mb-4">
                  Nous nous réservons le droit de résilier ou de suspendre votre compte et votre 
                  accès au Service immédiatement, sans préavis, pour quelque raison que ce soit, 
                  y compris en cas de violation de ces Conditions d'Utilisation.
                </p>
                <p className="mb-4">
                  Vous pouvez résilier votre compte à tout moment en nous contactant ou en 
                  supprimant votre compte depuis les paramètres.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">10. Modifications du service</h2>
                <p className="mb-4">
                  Nous nous réservons le droit de modifier, suspendre ou interrompre le Service 
                  à tout moment, avec ou sans préavis. Nous ne serons pas responsables envers 
                  vous ou tout tiers de toute modification, suspension ou interruption du Service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">11. Modifications des conditions</h2>
                <p className="mb-4">
                  Nous nous réservons le droit de modifier ces Conditions d'Utilisation à tout 
                  moment. Nous vous informerons de tout changement en publiant les nouvelles 
                  conditions sur cette page. Votre utilisation continue du Service après la 
                  publication des modifications constitue votre acceptation des nouvelles conditions.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">12. Droit applicable</h2>
                <p className="mb-4">
                  Ces Conditions d'Utilisation sont régies par les lois du [Votre juridiction]. 
                  Tout litige découlant de ces conditions sera soumis à la juridiction exclusive 
                  des tribunaux de [Votre juridiction].
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">13. Contact</h2>
                <p className="mb-4">
                  Si vous avez des questions concernant ces Conditions d'Utilisation, 
                  veuillez nous contacter à :
                </p>
                <p className="mb-4">
                  <strong>Email :</strong>{' '}
                  <a href="mailto:info@heliacode.com" className="link link-primary">
                    info@heliacode.com
                  </a>
                </p>
                <p className="mb-4">
                  Vous pouvez également consulter notre page{' '}
                  <Link to="/support" className="link link-primary">Support & Contact</Link> pour toute demande d'assistance.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">14. Dispositions générales</h2>
                <p className="mb-4">
                  Si une disposition de ces Conditions d'Utilisation est jugée invalide ou 
                  inapplicable, les autres dispositions resteront en vigueur. Ces conditions 
                  constituent l'accord complet entre vous et Inventory AI concernant l'utilisation 
                  du Service.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
