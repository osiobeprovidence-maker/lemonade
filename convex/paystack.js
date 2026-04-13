import { action } from "./_generated/server";
import { v } from "convex/values";
// Paystack webhook handler (for later integration)
export const handlePaystackWebhook = action({
    args: {
        event: v.string(),
        data: v.any(),
    },
    handler: async (ctx, args) => {
        console.log("Paystack webhook received:", args.event, args.data);
        switch (args.event) {
            case "charge.success":
                // Handle successful payment
                console.log("Payment successful:", args.data);
                break;
            case "transfer.success":
                // Handle successful withdrawal
                console.log("Transfer successful:", args.data);
                break;
            default:
                console.log("Unhandled Paystack event:", args.event);
        }
    },
});
