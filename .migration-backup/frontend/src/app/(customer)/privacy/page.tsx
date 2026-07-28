'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const sections = [
  { id: 'information-we-collect', title: 'Information We Collect', content: 'We collect information you provide directly, such as your name, email address, shipping address, and payment information when you create an account, make a purchase, or contact our support team. We also automatically collect certain information about your device and usage patterns when you visit our website.' },
  { id: 'how-we-use', title: 'How We Use Your Information', content: 'We use the information we collect to process transactions, send order confirmations and updates, provide customer support, personalize your shopping experience, improve our website and services, and send promotional communications (with your consent).' },
  { id: 'information-sharing', title: 'Information Sharing', content: 'We do not sell your personal information. We share your data only with trusted third-party service providers who assist in operating our platform (payment processors, shipping partners, analytics providers) and as required by law.' },
  { id: 'data-security', title: 'Data Security', content: 'We implement industry-standard security measures including SSL encryption, secure payment processing via Stripe, regular security audits, and strict access controls to protect your personal information.' },
  { id: 'cookies', title: 'Cookies & Tracking', content: 'We use cookies and similar technologies to maintain your session, remember your preferences, analyze website traffic, and personalize content. You can control cookie settings through your browser preferences.' },
  { id: 'your-rights', title: 'Your Rights', content: 'You have the right to access, correct, or delete your personal data. You can manage most of your information through your account settings, or contact our privacy team for additional requests.' },
  { id: 'retention', title: 'Data Retention', content: 'We retain your information for as long as your account is active or as needed to provide services. We will also retain data as necessary to comply with legal obligations, resolve disputes, and enforce our agreements.' },
  { id: 'children', title: 'Children\'s Privacy', content: 'CommerceFlow is not intended for use by children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.' },
  { id: 'changes', title: 'Changes to This Policy', content: 'We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the effective date.' },
  { id: 'contact', title: 'Contact Us', content: 'If you have questions about this Privacy Policy, please contact us at privacy@commerceflow.com or write to: CommerceFlow India, 91 Springboard, Cyber City, Gurugram, Haryana 122002.' },
];

export default function PrivacyPage() {
  return (
    <div className="container py-8 md:py-12 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: July 11, 2026</p>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground leading-relaxed mb-8">
            At CommerceFlow, we take your privacy seriously. This Privacy Policy describes how we collect, use, and protect your personal information when you use our website and services.
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
            Questions? <Link href="/contact" className="text-primary hover:underline">Contact our privacy team</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
