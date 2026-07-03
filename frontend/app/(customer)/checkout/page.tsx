"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useAppSelector } from "@/lib/hooks";
import { useCreateOrder } from "@/lib/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { formatPrice } from "@/lib/utils/formatting";

const checkoutSchema = z.object({
  firstName: z.string().min(2, "First name required"),
  lastName: z.string().min(2, "Last name required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Invalid phone number"),
  street: z.string().min(5, "Invalid address"),
  city: z.string().min(2, "City required"),
  state: z.string().min(2, "State required"),
  zipCode: z.string().min(5, "Invalid ZIP code"),
  country: z.string().min(2, "Country required"),
  cardNumber: z.string().regex(/^\d{16}$/, "Invalid card number"),
  expiryMonth: z.string().regex(/^\d{2}$/, "Invalid month"),
  expiryYear: z.string().regex(/^\d{2}$/, "Invalid year"),
  cvv: z.string().regex(/^\d{3}$/, "Invalid CVV"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { items, total } = useAppSelector((state) => state.cart);
  const { mutate: createOrder, isPending } = useCreateOrder();
  const [orderPlaced, setOrderPlaced] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const subtotal = total;
  const tax = subtotal * 0.1;
  const shipping = subtotal > 50 ? 0 : 10;
  const finalTotal = subtotal + tax + shipping;

  const onSubmit = (data: CheckoutFormData) => {
    const orderItems = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    createOrder(
      {
        items: orderItems,
        shippingAddressId: "default",
        paymentMethod: "credit_card",
      },
      {
        onSuccess: () => {
          setOrderPlaced(true);
        },
      }
    );
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Your cart is empty</p>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-md mx-auto">
          <div className="inline-block p-4 bg-green-100 dark:bg-green-900 rounded-full mb-6">
            <svg
              className="w-12 h-12 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your purchase. You&apos;ll receive an email confirmation shortly.
          </p>
          <div className="space-y-2 mb-6">
            <p className="text-sm">
              <strong>Order Number:</strong> #CF-2024-001
            </p>
            <p className="text-sm">
              <strong>Estimated Delivery:</strong> 5-7 business days
            </p>
          </div>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/account/orders">View Order</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/cart" className="text-primary hover:underline flex items-center gap-2 mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to Cart
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <Card className="p-8">
            <h1 className="text-2xl font-bold text-foreground mb-8">Checkout</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Shipping Address */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Shipping Address
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...register("firstName")}
                      className={errors.firstName ? "border-destructive" : ""}
                    />
                    {errors.firstName && (
                      <p className="text-destructive text-sm">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...register("lastName")}
                      className={errors.lastName ? "border-destructive" : ""}
                    />
                    {errors.lastName && (
                      <p className="text-destructive text-sm">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-destructive text-sm">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      className={errors.phone ? "border-destructive" : ""}
                    />
                    {errors.phone && (
                      <p className="text-destructive text-sm">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    {...register("street")}
                    className={errors.street ? "border-destructive" : ""}
                  />
                  {errors.street && (
                    <p className="text-destructive text-sm">{errors.street.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      {...register("city")}
                      className={errors.city ? "border-destructive" : ""}
                    />
                    {errors.city && (
                      <p className="text-destructive text-sm">{errors.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      {...register("state")}
                      className={errors.state ? "border-destructive" : ""}
                    />
                    {errors.state && (
                      <p className="text-destructive text-sm">{errors.state.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      {...register("zipCode")}
                      className={errors.zipCode ? "border-destructive" : ""}
                    />
                    {errors.zipCode && (
                      <p className="text-destructive text-sm">{errors.zipCode.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      {...register("country")}
                      className={errors.country ? "border-destructive" : ""}
                    />
                    {errors.country && (
                      <p className="text-destructive text-sm">{errors.country.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="border-t border-border pt-8">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Payment Information
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      {...register("cardNumber")}
                      className={errors.cardNumber ? "border-destructive" : ""}
                    />
                    {errors.cardNumber && (
                      <p className="text-destructive text-sm">
                        {errors.cardNumber.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryMonth">Month</Label>
                      <Input
                        id="expiryMonth"
                        placeholder="MM"
                        {...register("expiryMonth")}
                        className={errors.expiryMonth ? "border-destructive" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiryYear">Year</Label>
                      <Input
                        id="expiryYear"
                        placeholder="YY"
                        {...register("expiryYear")}
                        className={errors.expiryYear ? "border-destructive" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        {...register("cvv")}
                        className={errors.cvv ? "border-destructive" : ""}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={isPending} className="w-full" size="lg">
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isPending ? "Processing..." : "Place Order"}
              </Button>
            </form>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-20">
            <h2 className="text-lg font-bold text-foreground mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6 pb-6 border-b border-border">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.name} x {item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6 pb-6 border-b border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <div className="flex justify-between">
                <span className="font-bold text-foreground">Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
