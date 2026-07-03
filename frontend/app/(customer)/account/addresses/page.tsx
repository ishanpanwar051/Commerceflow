"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppSelector } from "@/lib/hooks";
import { useAddAddress } from "@/lib/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Plus, Trash2, MapPin } from "lucide-react";

const addressSchema = z.object({
  street: z.string().min(5, "Street address required"),
  city: z.string().min(2, "City required"),
  state: z.string().min(2, "State required"),
  zipCode: z.string().min(5, "ZIP code required"),
  country: z.string().min(2, "Country required"),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function AddressesPage() {
  const { profile } = useAppSelector((state) => state.user);
  const { mutate: addAddress, isPending } = useAddAddress();
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  const onSubmit = (data: AddressFormData) => {
    addAddress(
      { ...data, type: "home", isDefault: !profile?.addresses?.length },
      {
        onSuccess: () => {
          reset();
          setShowForm(false);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Saved Addresses</h1>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Address
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
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

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Address
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  reset();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {profile?.addresses && profile.addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.addresses.map((address) => (
            <Card key={address.id} className="p-6 relative">
              {address.isDefault && (
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  Default
                </div>
              )}
              <div className="flex gap-3 mb-4">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground capitalize">
                    {address.type} Address
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {address.street}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                  <p className="text-sm text-muted-foreground">{address.country}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            No saved addresses yet
          </p>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Address
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
