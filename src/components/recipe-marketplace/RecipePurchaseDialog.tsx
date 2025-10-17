/**
 * Recipe Purchase Dialog Component
 * Handles the complete purchase flow for recipe licenses
 */

"use client"
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, Building2, Wallet, Info, Shield, 
  CheckCircle, AlertTriangle, DollarSign, Calendar,
  TrendingUp, Users, Star, Lock, Zap
} from 'lucide-react'

import { LicensedRecipe } from '@/lib/recipe-marketplace/recipe-licensing'
import { recipePaymentProcessor } from '@/lib/recipe-marketplace/recipe-payment-processor'

interface RecipePurchaseDialogProps {
  recipe: LicensedRecipe;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseComplete?: (licenseId: string) => void;
}

export function RecipePurchaseDialog({
  recipe,
  open,
  onOpenChange,
  onPurchaseComplete
}: RecipePurchaseDialogProps) {
  const [selectedLicenseType, setSelectedLicenseType] = useState<'one-time' | 'subscription' | 'royalty'>('one-time')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'crypto'>('card')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Calculate pricing based on license type
  const getPricing = () => {
    const { pricing } = recipe.licensing
    
    switch (selectedLicenseType) {
      case 'one-time':
        return {
          amount: pricing.oneTime || 0,
          description: 'One-time payment, lifetime access',
          recurring: false
        }
      case 'subscription':
        return {
          amount: pricing.monthly || 0,
          description: pricing.yearly ? 
            `$${pricing.monthly}/month or $${pricing.yearly}/year (save ${Math.round((1 - (pricing.yearly / (pricing.monthly * 12))) * 100)}%)` :
            `$${pricing.monthly}/month`,
          recurring: true
        }
      case 'royalty':
        return {
          amount: 0,
          description: `${pricing.royaltyPercent}% of net profit per cycle (min $${pricing.royaltyMinimum || 100})`,
          recurring: true
        }
    }
  }
  
  const pricing = getPricing()
  
  const handlePurchase = async () => {
    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions')
      return
    }
    
    setIsProcessing(true)
    setError(null)
    
    try {
      // Process payment
      const result = await recipePaymentProcessor.processPurchase(
        recipe,
        'current-user-id', // Would get from auth context
        'payment-method-id', // Would get from payment form
        selectedLicenseType
      )
      
      onPurchaseComplete?.(result.license.id)
      onOpenChange(false)
    } catch (err) {
      setError('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Purchase Recipe License</DialogTitle>
          <DialogDescription>
            Complete your purchase of "{recipe.name}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          {/* Recipe Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">{recipe.name}</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-gray-500" />
                <span>{recipe.statistics.activeUsers} active users</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span>{recipe.statistics.successRate}% success rate</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span>{recipe.statistics.avgRating.toFixed(1)}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {recipe.features.slice(0, 3).map(feature => (
                <Badge key={feature.id} variant="secondary">
                  {feature.name}
                  {feature.improvement && (
                    <span className="ml-1 text-green-600">
                      +{feature.improvement}{feature.unit || '%'}
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* License Type Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Select License Type
            </Label>
            <RadioGroup
              value={selectedLicenseType}
              onValueChange={(v) => setSelectedLicenseType(v as any)}
            >
              {recipe.licensing.pricing.oneTime && (
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="one-time" id="one-time" />
                  <label htmlFor="one-time" className="flex-1 cursor-pointer">
                    <div className="font-medium">One-Time License</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Pay once, use forever. Best for established operations.
                    </div>
                    <div className="text-lg font-semibold mt-2">
                      ${recipe.licensing.pricing.oneTime}
                    </div>
                  </label>
                </div>
              )}
              
              {recipe.licensing.pricing.monthly && (
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer mt-3">
                  <RadioGroupItem value="subscription" id="subscription" />
                  <label htmlFor="subscription" className="flex-1 cursor-pointer">
                    <div className="font-medium">Subscription License</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Monthly payments with ongoing support and updates.
                    </div>
                    <div className="text-lg font-semibold mt-2">
                      ${recipe.licensing.pricing.monthly}/month
                    </div>
                  </label>
                </div>
              )}
              
              {recipe.licensing.pricing.royaltyPercent && (
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer mt-3">
                  <RadioGroupItem value="royalty" id="royalty" />
                  <label htmlFor="royalty" className="flex-1 cursor-pointer">
                    <div className="font-medium">Royalty-Based License</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Pay {recipe.licensing.pricing.royaltyPercent}% of net profit per cycle.
                      Perfect for testing new recipes with low upfront cost.
                    </div>
                    <div className="text-lg font-semibold mt-2">
                      No upfront cost
                    </div>
                  </label>
                </div>
              )}
            </RadioGroup>
          </div>
          
          {/* Payment Method */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Payment Method
            </Label>
            <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="card">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Card
                </TabsTrigger>
                <TabsTrigger value="bank">
                  <Building2 className="w-4 h-4 mr-2" />
                  Bank
                </TabsTrigger>
                <TabsTrigger value="crypto">
                  <Wallet className="w-4 h-4 mr-2" />
                  Crypto
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="card" className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      className="mt-1"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="bank" className="mt-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Bank transfer instructions will be sent to your email after confirmation.
                  </AlertDescription>
                </Alert>
              </TabsContent>
              
              <TabsContent value="crypto" className="mt-4">
                <Alert>
                  <Wallet className="h-4 w-4" />
                  <AlertDescription>
                    USDC payments accepted. Wallet address will be provided after confirmation.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Terms & Conditions */}
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg space-y-2 max-h-32 overflow-y-auto">
              <h4 className="font-medium text-sm">License Terms</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {recipe.licensing.termsOfUse.map((term, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
              {recipe.licensing.restrictions.length > 0 && (
                <>
                  <h4 className="font-medium text-sm mt-3">Restrictions</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {recipe.licensing.restrictions.map((restriction, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>{restriction}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <label htmlFor="terms" className="text-sm cursor-pointer">
                I agree to the license terms and conditions, including the 15% platform fee
              </label>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>License Fee</span>
              <span>${pricing.amount.toFixed(2)}</span>
            </div>
            {pricing.amount > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Platform Fee (15%)</span>
                <span>${(pricing.amount * 0.15).toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total Due Now</span>
              <span>${pricing.amount.toFixed(2)}</span>
            </div>
            {pricing.recurring && (
              <p className="text-xs text-gray-600 text-right">
                {pricing.description}
              </p>
            )}
          </div>
          
          {/* What's Included */}
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <div className="font-medium">What's included:</div>
              <ul className="text-sm space-y-1">
                {recipe.licensing.supportIncluded && (
                  <li>✓ Creator support for implementation</li>
                )}
                {recipe.licensing.updateIncluded && (
                  <li>✓ Recipe updates and improvements</li>
                )}
                <li>✓ Access to community discussion</li>
                <li>✓ Performance tracking tools</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={isProcessing || !agreedToTerms}
              className="flex-1"
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Complete Purchase
                </>
              )}
            </Button>
          </div>
          
          {/* Security Notice */}
          <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
            <Shield className="w-4 h-4" />
            <span>Secure payment processed by Stripe</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}