export interface CommerceOverviewStats {
    total_spend_this_month: number;
    active_campaigns: number;
    active_classifieds: number;
    active_coupons: number;
    total_impressions_this_month: number;
}

export interface SpendBreakdown {
    ad_campaigns: number;
    announcements: number;
    classifieds: number;
    coupons: number;
    legal_notices: number;
}

export const commerceService = {
    getOverviewStats: async (): Promise<CommerceOverviewStats> => {
        // Mock data for development
        return {
            total_spend_this_month: 247.50,
            active_campaigns: 2,
            active_classifieds: 3,
            active_coupons: 1,
            total_impressions_this_month: 12450
        };
    },

    getSpendBreakdown: async (): Promise<SpendBreakdown> => {
        // Mock data for development
        return {
            ad_campaigns: 145.00,
            announcements: 0,
            classifieds: 50.00,
            coupons: 52.50,
            legal_notices: 0
        };
    }
};
