import { ContactForm } from '@/components/ContactForm';

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Contactez-nous</h1>
          <p className="text-xl text-muted-foreground">
            N'hésitez pas à nous contacter pour toute question ou demande d'information
          </p>
        </div>

        <div className="flex justify-center">
          <ContactForm title="Formulaire de contact" />
        </div>

        <div className="mt-12 text-center space-y-4">
          <h2 className="text-2xl font-semibold">Autres moyens de nous contacter</h2>
          <div className="space-y-2 text-muted-foreground">
            <p>📧 Email: ufsbd34@ufsbd.fr</p>
            <p>📍 Adresse: Union Française pour la Santé Bucco-Dentaire - Section 34</p>
          </div>
        </div>
      </div>
    </div>
  );
}