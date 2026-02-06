import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEnvelope, faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const SUPPORT_EMAIL = 'info@heliacode.com';

export default function Support() {
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
            <h1 className="mb-2 flex items-center gap-3 text-4xl font-bold">
              <FontAwesomeIcon icon={faCircleQuestion} className="text-primary" />
              Support & Contact
            </h1>
            <p className="mb-8 text-muted-foreground">
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
                    className="text-primary font-semibold underline-offset-4 hover:underline"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </p>
                <p className="mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faEnvelope} />
                  <Button asChild size="sm">
                  <a href={`mailto:${SUPPORT_EMAIL}`}>
                    Envoyer un email
                  </a>
                </Button>
                </p>
                <p className="text-sm text-muted-foreground">
                  Nous nous efforçons de répondre dans les meilleurs délais.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Liens utiles</h2>
                <ul className="list-none space-y-2">
                  <li>
                    <Link to="/terms" className="text-primary underline-offset-4 hover:underline">
                      Conditions d'utilisation
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacy" className="text-primary underline-offset-4 hover:underline">
                      Politique de confidentialité
                    </Link>
                  </li>
                  <li>
                    <Link to="/cookies" className="text-primary underline-offset-4 hover:underline">
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
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline-offset-4 hover:underline">
                    {SUPPORT_EMAIL}
                  </a>
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
