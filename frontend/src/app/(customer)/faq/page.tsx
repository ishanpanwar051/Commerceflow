'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

const faqCategories = [
  {
    category: 'Orders & Shipping',
    questions: [
      { q: 'How do I track my order?', a: 'Go to My Orders in your account and click on any order to see its tracking details. You can also use the Track Order page with your order number.' },
      { q: 'How long does shipping take?', a: 'Standard shipping takes 5-7 business days. Express shipping delivers within 2-3 business days. Delivery times may vary based on your location.' },
      { q: 'Can I change my order after placing it?', a: 'You can modify or cancel your order within 1 hour of placing it. After that, the order enters processing and cannot be changed.' },
      { q: 'Do you offer free shipping?', a: 'Yes! We offer free shipping on all orders above ₹499. For orders below that amount, a flat shipping fee of ₹49 applies.' },
    ],
  },
  {
    category: 'Returns & Refunds',
    questions: [
      { q: 'How do I return a product?', a: 'Go to My Orders, select the order containing the item you want to return, and click "Request Return". Follow the on-screen instructions to schedule a pickup.' },
      { q: 'How long do I have to return an item?', a: 'Most items can be returned within 30 days of delivery. Some categories like perishables and personal care items are non-returnable.' },
      { q: 'When will I receive my refund?', a: 'Refunds are processed within 5-7 business days after we receive the returned item. The amount will be credited to your original payment method.' },
      { q: 'Are shipping costs refundable?', a: 'Original shipping charges are non-refundable unless the return is due to a defective or incorrect product from our side.' },
    ],
  },
  {
    category: 'Account & Payments',
    questions: [
      { q: 'How do I create an account?', a: 'Click the Register button in the top navigation and fill in your details. You can also register using your email address.' },
      { q: 'What payment methods do you accept?', a: 'We accept credit/debit cards (Visa, Mastercard, Amex), UPI, net banking, and popular wallets like Paytm and PhonePe through our secure payment partner Stripe.' },
      { q: 'Is my payment information secure?', a: 'Absolutely. We use Stripe for payment processing with PCI DSS Level 1 compliance. We never store your full card details on our servers.' },
      { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login page, enter your email, and follow the link sent to your inbox to create a new password.' },
    ],
  },
  {
    category: 'Products & Sellers',
    questions: [
      { q: 'Are the products authentic?', a: 'Yes! All products on CommerceFlow are verified for authenticity. We work only with authorized sellers and brands.' },
      { q: 'How do I become a seller?', a: 'Visit our Seller Portal to apply. Your application will be reviewed within 48 hours, and upon approval, you can start listing products.' },
      { q: 'What if I receive a damaged product?', a: 'Contact us within 48 hours of delivery with photos of the damage. We will arrange a free pickup and either replace the item or issue a full refund.' },
    ],
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full p-4 text-left hover:bg-muted/50 transition-colors">
        <span className="font-medium text-sm pr-4">{question}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqPage() {
  const [search, setSearch] = useState('');

  const allQuestions = faqCategories.flatMap((cat) =>
    cat.questions.map((q) => ({ ...q, category: cat.category }))
  );

  const filtered = search
    ? allQuestions.filter(
        (q) =>
          q.q.toLowerCase().includes(search.toLowerCase()) ||
          q.a.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  return (
    <div className="container py-8 md:py-12 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <HelpCircle className="h-10 w-10 mx-auto mb-3 text-primary" />
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">Find answers to common questions about shopping on CommerceFlow</p>
      </motion.div>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search FAQ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
      </div>

      {filtered ? (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No results found for &ldquo;{search}&rdquo;</p>
          ) : (
            filtered.map((q, i) => <FaqItem key={i} question={q.q} answer={q.a} />)
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {faqCategories.map((cat) => (
            <motion.div key={cat.category} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-lg font-bold mb-3">{cat.category}</h2>
              <div className="space-y-3">
                {cat.questions.map((q, i) => (
                  <FaqItem key={i} question={q.q} answer={q.a} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-12 pt-8 border-t text-center">
        <p className="text-sm text-muted-foreground mb-2">Can&apos;t find what you&apos;re looking for?</p>
        <Link href="/contact" className="text-primary hover:underline text-sm font-medium">Contact our support team</Link>
      </div>
    </div>
  );
}
