
import { useEffect, useState } from 'react';
import { useRouter } from '@/lib/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, CreditCard } from 'lucide-react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { addressService } from '@/services/address.service';
import { orderService } from '@/services/order.service';
import { paymentService } from '@/services/payment.service';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null;

const checkoutSchema = z.object({
  shippingAddressId: z.string().min(1, 'Select a shipping address'),
  billingAddressId: z.string().optional(),
  notes: z.string().optional(),
});

function PaymentForm({
  paymentIntentId,
  orderId,
  onSuccess,
}: {
  paymentIntentId: string;
  orderId: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [origin] = useState(() => window.location.origin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setError('Payment system not initialized. Please try again.');
      return;
    }
    setProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setProcessing(false);
      return;
    }

    const { error: payError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${origin}/orders/${orderId}` },
      redirect: 'if_required',
    });

    if (payError) {
      setError(payError.message || 'Payment failed');
      setProcessing(false);
      return;
    }

    try {
      await paymentService.confirmPayment(paymentIntentId);
    } catch {}

    toast.success('Payment successful!');
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" size="lg" disabled={!stripe || processing}>
        {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
        Pay Now
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discount, loadCart } = useCart();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<{ clientSecret: string; paymentIntentId: string } | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const { data: addresses, isLoading: addressesLoading, isError: addressesError } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressService.getAddresses(),
    enabled: isAuthenticated,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
  });

  useEffect(() => { if (isAuthenticated) loadCart(); }, [isAuthenticated, loadCart]);

  useEffect(() => {
    if (addresses && addresses.length > 0 && !addressesLoading) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      if (defaultAddr) {
        setValue('shippingAddressId', defaultAddr.id);
      }
    }
  }, [addresses, addressesLoading, setValue]);

  if (authLoading) {
    return <div className="container py-8 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const shipping = subtotal >= 49900 ? 0 : 4900;
  const tax = subtotal * 0.18;
  const total = subtotal - (discount || 0) + tax + shipping;

  const onSubmit = async (data: z.infer<typeof checkoutSchema>) => {
    setIsProcessing(true);
    try {
      const result = await orderService.checkout({
        shippingAddressId: data.shippingAddressId,
        billingAddressId: data.billingAddressId || data.shippingAddressId,
        notes: data.notes,
      });

      setOrderId(result.order.id);

      if (result.paymentIntent?.clientSecret) {
        setPaymentIntent({
          clientSecret: result.paymentIntent.clientSecret,
          paymentIntentId: result.paymentIntent.paymentIntentId,
        });
      } else {
        toast.success('Order placed successfully!');
        router.push(`/orders/${result.order.id}`);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally { setIsProcessing(false); }
  };

  const options: StripeElementsOptions | undefined = paymentIntent
    ? { clientSecret: paymentIntent.clientSecret, appearance: { theme: 'stripe' } }
    : undefined;

  return (
    <div className="container py-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
              <CardDescription>Select where to ship your order</CardDescription>
            </CardHeader>
            <CardContent>
              {addressesLoading ? (
                <div className="space-y-2"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
              ) : addressesError ? (
                <p className="text-sm text-destructive">Failed to load addresses. Please try again.</p>
              ) : addresses?.length ? (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label key={addr.id} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent ${addr.isDefault ? 'border-primary' : ''}`}>
                      <input type="radio" value={addr.id} {...register('shippingAddressId')} defaultChecked={addr.isDefault} className="mt-1" />
                      <div>
                        <p className="font-medium text-sm">{addr.label || 'Address'}</p>
                        <p className="text-sm text-muted-foreground">{addr.line1}, {addr.city}, {addr.state} {addr.zipCode}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No addresses found. Please add one in your profile.</p>
              )}
              {errors.shippingAddressId && <p className="text-sm text-destructive mt-1">{errors.shippingAddressId.message}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Notes</CardTitle>
              <CardDescription>Any special instructions?</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                {...register('notes')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                placeholder="Optional notes for your order..."
              />
            </CardContent>
          </Card>

          {paymentIntent && options && (
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
                <CardDescription>Complete your payment securely</CardDescription>
              </CardHeader>
              <CardContent>
                {!stripePromise ? (
                  <p className="text-sm text-destructive">Payment system is not configured. Please contact support.</p>
                ) : (
                  <Elements stripe={stripePromise} options={options}>
                  <PaymentForm
                      paymentIntentId={paymentIntent.paymentIntentId}
                      orderId={orderId!}
                      onSuccess={() => router.push(`/orders/${orderId}`)}
                  />
                  </Elements>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.slice(0, 3).map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate max-w-[200px]">{item.product.name} x{item.quantity}</span>
                  <span>{formatPrice(item.product.basePrice * item.quantity)}</span>
                </div>
              ))}
              {items.length > 3 && <p className="text-xs text-muted-foreground">+{items.length - 3} more items</p>}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax</span><span>{formatPrice(tax)}</span></div>
                <div className="flex justify-between font-semibold border-t pt-2"><span>Total</span><span>{formatPrice(total)}</span></div>
              </div>
              {!paymentIntent && (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Button type="submit" className="w-full" size="lg" disabled={isProcessing || !addresses?.length}>
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Place Order
                  </Button>
                  {!addressesLoading && !addresses?.length && (
                    <p className="text-xs text-destructive text-center mt-2">Please add a shipping address in your profile.</p>
                  )}
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
