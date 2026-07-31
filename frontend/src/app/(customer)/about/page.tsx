
import { motion } from 'framer-motion';
import { Shield, Truck, HeartHandshake, Users, Target, Zap } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const values = [
  { icon: Shield, title: 'Trust & Security', description: 'Every transaction is encrypted and your data is always protected.' },
  { icon: Truck, title: 'Fast Delivery', description: 'We partner with premium logistics providers for swift, reliable delivery.' },
  { icon: HeartHandshake, title: 'Customer First', description: 'Our dedicated support team is available 24/7 to assist you.' },
  { icon: Users, title: 'Community', description: 'Join millions of satisfied shoppers who trust CommerceFlow.' },
  { icon: Target, title: 'Quality Products', description: 'Every product is verified for quality before it reaches your doorstep.' },
  { icon: Zap, title: 'Innovation', description: 'We constantly innovate to provide the best shopping experience.' },
];

const stats = [
  { value: '10M+', label: 'Happy Customers' },
  { value: '500K+', label: 'Products' },
  { value: '50K+', label: 'Sellers' },
  { value: '99.9%', label: 'Uptime' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="container relative text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About CommerceFlow</h1>
            <p className="text-lg text-muted-foreground">Building the future of e-commerce, one order at a time.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed">
              CommerceFlow was founded with a simple mission: make online shopping accessible, reliable, and enjoyable for everyone. What started as a small team of passionate engineers has grown into a platform serving millions of customers worldwide.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mt-4">
              We combine cutting-edge technology with a deep understanding of our customers to deliver a shopping experience that&apos;s fast, secure, and delightful. From electronics to fashion, home goods to beauty, we curate the best products from trusted sellers around the globe.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Our Numbers Speak</h2>
            <p className="text-muted-foreground">Milestones that drive us forward</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center p-6 rounded-xl bg-background border">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Our Values</h2>
            <p className="text-muted-foreground">The principles that guide everything we do</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {values.map((val, i) => {
              const Icon = val.icon;
              return (
                <motion.div key={val.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-6 rounded-xl border hover:shadow-lg transition-all group">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{val.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{val.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold mb-4">Join the CommerceFlow Family</h2>
            <p className="text-primary-foreground/80 mb-8">Experience shopping reimagined. Browse thousands of products from trusted sellers.</p>
            <Link href="/products">
              <Button size="lg" variant="secondary" className="text-base px-10">Start Shopping</Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
