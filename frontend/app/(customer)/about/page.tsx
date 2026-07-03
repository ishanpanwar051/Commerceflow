export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-6">About Commerceflow</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-muted-foreground mb-6">
            Commerceflow is a modern e-commerce platform dedicated to bringing you premium products
            with an exceptional shopping experience.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Our Mission</h2>
          <p className="text-muted-foreground mb-6">
            We believe shopping should be seamless, enjoyable, and rewarding. Our mission is to
            connect customers with the products they love through intelligent recommendations and
            a frictionless checkout experience.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Why Choose Us?</h2>
          <ul className="space-y-3 text-muted-foreground mb-6">
            <li className="flex gap-3">
              <span className="text-primary">✓</span>
              <span>Curated selection of premium products</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary">✓</span>
              <span>AI-powered personalized recommendations</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary">✓</span>
              <span>Fast and free shipping on orders over $50</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary">✓</span>
              <span>30-day hassle-free returns</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary">✓</span>
              <span>Secure checkout and customer support</span>
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Our Story</h2>
          <p className="text-muted-foreground">
            Founded in 2024, Commerceflow started with a simple idea: make shopping online as
            enjoyable and personal as visiting your favorite local store. Since then, we&apos;ve grown
            to serve thousands of customers who trust us for quality, reliability, and service.
          </p>
        </div>
      </div>
    </div>
  );
}
