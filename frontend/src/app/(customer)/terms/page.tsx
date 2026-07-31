
import { motion } from 'framer-motion';
import { Link } from 'wouter';

const sections = [
  { id: 'acceptance', title: 'Acceptance of Terms', content: 'By accessing or using CommerceFlow, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.' },
  { id: 'accounts', title: 'User Accounts', content: 'You must be at least 13 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information when creating your account.' },
  { id: 'products', title: 'Products & Pricing', content: 'All product descriptions, images, and specifications are provided by sellers and are subject to change. We strive for accuracy but do not warrant that product descriptions are error-free. Prices are in INR and are subject to change without notice. We reserve the right to cancel orders in case of pricing errors.' },
  { id: 'orders', title: 'Orders & Payments', content: 'By placing an order, you are making an offer to purchase a product. We reserve the right to accept or decline any order. Payment must be received before an order is processed. We accept major credit cards, debit cards, UPI, net banking, and digital wallets through our secure payment partner Stripe.' },
  { id: 'shipping', title: 'Shipping & Delivery', content: 'Delivery times are estimates and may vary based on your location and the shipping method selected. We are not responsible for delays caused by shipping carriers or customs processing. Risk of loss and title for products pass to you upon delivery to the carrier.' },
  { id: 'returns', title: 'Returns & Refunds', content: 'Most items can be returned within 30 days of delivery in their original condition. Refunds are processed within 5-7 business days after we receive the returned item. Some products may be excluded from return eligibility. Shipping costs are non-refundable unless the return is due to our error.' },
  { id: 'prohibited', title: 'Prohibited Conduct', content: 'You agree not to: use our platform for any illegal purpose, attempt to gain unauthorized access to our systems, use automated tools to scrape or access our data, post false or misleading reviews, or interfere with the proper functioning of the platform.' },
  { id: 'ip', title: 'Intellectual Property', content: 'All content on CommerceFlow, including logos, text, graphics, and software, is the property of CommerceFlow or its licensors and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.' },
  { id: 'liability', title: 'Limitation of Liability', content: 'CommerceFlow shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the platform. Our total liability shall not exceed the amount paid by you for the product in question.' },
  { id: 'governing-law', title: 'Governing Law', content: 'These terms are governed by and construed in accordance with the laws of India. Any disputes shall be resolved through arbitration in Bangalore, India.' },
  { id: 'modifications', title: 'Modifications', content: 'We reserve the right to modify these terms at any time. Changes will be effective upon posting. Your continued use of the platform after changes are posted constitutes acceptance of the modified terms.' },
];

export default function TermsPage() {
  return (
    <div className="container py-8 md:py-12 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: July 11, 2026</p>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground leading-relaxed mb-8">
            Welcome to CommerceFlow. These Terms of Service govern your use of our platform and services. Please read them carefully before using CommerceFlow.
          </p>

          <div className="space-y-8">
            {sections.map((section, i) => (
              <motion.div key={section.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <h2 className="text-xl font-bold mb-3 mt-8">{section.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            Questions? <Link href="/contact" className="text-primary hover:underline">Contact us</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
