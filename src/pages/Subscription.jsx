import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { requireProvider } from '../utils/userTypeUtils';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const plans = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: '€29.99',
    priceId: process.env.REACT_APP_STRIPE_MONTHLY_PRICE_ID,
    features: [
      'Access to messaging system',
      'Analytics dashboard',
      'Priority support',
      'Cancel anytime'
    ],
    interval: 'month'
  },
  {
    id: 'annual',
    name: 'Annual Plan',
    price: '€299.99',
    priceId: process.env.REACT_APP_STRIPE_ANNUAL_PRICE_ID,
    features: [
      'All Monthly Plan features',
      'Two months free',
      'Enhanced analytics',
      'Priority listing'
    ],
    interval: 'year'
  }
];

const Subscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [provider, setProvider] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await requireProvider(navigate);
      if (hasAccess) {
        loadSubscriptionDetails();
      }
    };
    checkAccess();
  }, [navigate]);

  const loadSubscriptionDetails = async () => {
    try {
      // Get provider details
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (providerError) throw providerError;
      setProvider(providerData);

      // Get current subscription
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('provider_id', providerData.id)
        .single();

      if (subError && subError.code !== 'PGRST116') throw subError;
      setCurrentSubscription(subData);
    } catch (error) {
      console.error('Error loading subscription details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handleSubscribe = async (plan) => {
    try {
      setProcessing(true);

      // Create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          providerId: provider.id,
          customerId: currentSubscription?.stripe_customer_id,
          successUrl: `${window.location.origin}/provider-dashboard`,
          cancelUrl: `${window.location.origin}/subscription`,
        }),
      });

      const session = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (error) {
        console.error('Error redirecting to checkout:', error);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setProcessing(true);
      
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: currentSubscription.stripe_subscription_id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      await loadSubscriptionDetails();
    } catch (error) {
      console.error('Error canceling subscription:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">{t('subscription.title')}</h1>

      {currentSubscription?.status === 'active' && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">{t('subscription.currentPlan.title')}</h2>
          <p className="text-gray-600 mb-4">
            {t('subscription.currentPlan.status', {
              status: currentSubscription.status,
              date: new Date(currentSubscription.current_period_end).toLocaleDateString()
            })}
          </p>
          <button
            onClick={handleCancelSubscription}
            disabled={processing}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            {processing ? t('common.processing') : t('subscription.currentPlan.cancel')}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-lg shadow p-6 border-2 ${
              selectedPlan?.id === plan.id ? 'border-blue-500' : 'border-transparent'
            }`}
          >
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <p className="text-3xl font-bold text-blue-600 mb-4">{plan.price}</p>
            <p className="text-gray-600 mb-4">
              {t('subscription.billingInterval', { interval: plan.interval })}
            </p>
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan)}
              disabled={processing || currentSubscription?.status === 'active'}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {processing
                ? t('common.processing')
                : currentSubscription?.status === 'active'
                ? t('subscription.alreadySubscribed')
                : t('subscription.subscribe')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subscription;
