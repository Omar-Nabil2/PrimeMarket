import { Injectable } from '@angular/core';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private stripePromise = loadStripe(environment.stripePublishableKey);
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;

  async mountCardElement(): Promise<void> {
    this.stripe = await this.stripePromise; // always awaited, no race
    if (!this.stripe) return;

    this.elements = this.stripe.elements();
    const card = this.elements.create('card', {
      style: {
        base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } }
      }
    });
    card.mount('#stripe-element');
  }

  async confirmPayment(clientSecret: string): Promise<{ error?: string }> {
    this.stripe = await this.stripePromise;
    if (!this.stripe || !this.elements) return { error: 'Stripe not initialized' };

    const cardElement = this.elements.getElement('card');
    if (!cardElement) return { error: 'Card element not found' };

    const { error } = await this.stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement }
    });

    return { error: error?.message };
  }
}
