import Stripe from 'stripe'
import EntityService from '@/app/api/utils/services/EntityService'
import { STATUS_PAYMENT_COMPLETED } from '@/app/api/utils/constants'

export default class PaymentService extends EntityService {
    protected stripe

    constructor(supabase) {
        super(supabase)
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
    }

    public async getPaymentLink(providerId: string, language: string): Promise<string> {
        const { data } = await this.supabase
            .from('business_claims')
            .select(`
                id,
                payment_id,
                payment_customer_id,
                payment_status,
                subscription_plan_id (
                    subscription_url
                )
            `)
            .eq('provider_id', providerId)
            .limit(1)
            .single()

        const customer = data?.payment_customer_id
        if (customer && data?.payment_status === STATUS_PAYMENT_COMPLETED) {
            return this.getManagingLink(providerId, customer, language)
        }

        return data?.id && data?.subscription_plan_id?.subscription_url ?
            `${data.subscription_plan_id.subscription_url}?client_reference_id=${data.id}` :
            ''
    }

    protected async getManagingLink(providerId: string, customer: string, language: string): Promise<string> {
        try {
            const portalSession = await this.stripe.billingPortal.sessions.create({
                customer,
                return_url: `${process.env.NEXT_PUBLIC_DOMAIN}/${language}/dashboard/${providerId}`,
            })

            return portalSession?.url
        } catch (err) {
            console.log('err = ', err)
        }

        return ''
    }

    public async getPaymentInfo(providerId: string) {
        const { data } = await this.supabase
            .from('business_claims')
            .select(`
                payment_id,
                subscription_plan_id (
                    subscription_url,
                    amount,
                    currency,
                    name
                )
            `)
            .eq('provider_id', providerId)
            .eq('payment_status', STATUS_PAYMENT_COMPLETED)
            .limit(1)
            .single()

        if (!data) {
            return null
        }

        let subscription = null
        if (data?.payment_id) {
            subscription = await this.stripe.subscriptions.retrieve(data.payment_id)
        }

        return {
            name: data?.subscription_plan_id?.name || '',
            amount: data?.subscription_plan_id?.amount || 0,
            currency: data?.subscription_plan_id?.currency || '',
            nextPayment: subscription?.current_period_end ? subscription?.current_period_end * 1000 : 0
        }
    }

    public async addPayment(claimId: string, paymentId: string, customer: string): Promise<boolean> {
        const subscription = await this.stripe.subscriptions.retrieve(paymentId)
        const externalProductId = subscription?.plan?.product as string

        const { data: subscriptionPlans } = await this.supabase
            .from('subscription_plans')
            .select('id')
            .eq('external_product_id', externalProductId)
            .limit(1)

        const { error } = await this.supabase
            .from('business_claims')
            .update({
                payment_id: paymentId,
                payment_status: STATUS_PAYMENT_COMPLETED,
                payment_customer_id: customer,
                ...(subscriptionPlans?.[0]?.id ? { subscription_plan_id: subscriptionPlans?.[0]?.id } : {})
            })
            .eq('id', claimId)

        return !error
    }

    public async getPaymentSession(sessionId: string) {
        try {
            const {
                subscription: paymentId, client_reference_id: claimId, customer
            } = await this.stripe.checkout.sessions.retrieve(sessionId)

            return {
                paymentId,
                claimId,
                customer
            }
        } catch (err) {
            console.log('err = ', err)
        }

        return {}
    }
}