import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEnvelope, faCircleQuestion } from '@fortawesome/free-solid-svg-icons';

const SUPPORT_EMAIL = 'info@heliacode.com';

export default function Support() {
  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="btn btn-ghost mb-6">
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Retour à l'accueil
        </Link>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <FontAwesomeIcon icon={faCircleQuestion} className="text-primary" />
              Support & Contact
            </h1>
            <p className="text-base-content/70 mb-8">
              Une question, un problème ou une demande ? Nous sommes là pour vous aider.
            </p>

            <div className="prose max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Nous contacter</h2>
                <p className="mb-4">
                  Pour toute question relative à l'application Inventory AI (connexion, compte,
                  fonctionnalités, signalement de bug ou demande d'assistance), vous pouvez
                  nous joindre à l'adresse suivante :
                </p>
                <p className="mb-4">
                  <strong>Email :</strong>{' '}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="link link-primary font-semibold"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </p>
                <p className="mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faEnvelope} />
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="btn btn-primary btn-sm">
                    Envoyer un email
                  </a>
                </p>
                <p className="text-sm text-base-content/70">
                  Nous nous efforçons de répondre dans les meilleurs délais.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Liens utiles</h2>
                <ul className="list-none space-y-2">
                  <li>
                    <Link to="/terms" className="link link-hover">
                      Conditions d'utilisation
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacy" className="link link-hover">
                      Politique de confidentialité
                    </Link>
                  </li>
                  <li>
                    <Link to="/cookies" className="link link-hover">
                      Politique des cookies
                    </Link>
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Heliacode</h2>
                <p className="mb-4">
                  Inventory AI est développé par Heliacode. Pour toute demande générale
                  ou commerciale, utilisez la même adresse de contact :{' '}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="link link-primary">
                    {SUPPORT_EMAIL}
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
