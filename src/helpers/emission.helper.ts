export class EmissionHelper {
    static readonly TOTAL_EMISSION = 50_000_000_000;
    static readonly HALVING_INTERVAL_DAYS = 730;
    static readonly TOTAL_HALVING_PERIODS = 10;
    static readonly CLASS_THRESHOLDS: Record<number, number> = {
        1: 2000,
        2: 4000,
        3: 6000,
        4: 8000,
        5: 10000,
    };

    static readonly A: number = (EmissionHelper.TOTAL_EMISSION * 1024) / 2046;

    static getDailyEmission(day: number): number {
        const halvingIndex = Math.floor(day / this.HALVING_INTERVAL_DAYS);
        if (halvingIndex >= this.TOTAL_HALVING_PERIODS) return 0;
        const dailyBase = this.A / this.HALVING_INTERVAL_DAYS;
        return dailyBase * Math.pow(0.5, halvingIndex);
    }

    static getActiveClasses(N_total: number): number[] {
        return Object.entries(this.CLASS_THRESHOLDS)
            .filter(([_, threshold]) => N_total >= threshold)
            .map(([c]) => parseInt(c));
    }

    static calculateClassEmissions(
        E_d: number,
        activeClasses: number[]
    ): { classEmissions: Record<number, number>; reserveTotal: number } {
        const classEmissions: Record<number, number> = {};
        let reserveTotal = 0;

        for (let c = 1; c <= 5; c++) {
            const base = 0.1 * E_d;
            const variable = (E_d - base) / Math.pow(2, 5 - c);
            const classTotal = base + variable;

            if (activeClasses.includes(c)) {
                classEmissions[c] = classTotal;
            } else {
                classEmissions[c] = 0;
                reserveTotal += classTotal;
            }
        }

        return { classEmissions, reserveTotal };
    }

    static getPerNodeReward(classEmissions: Record<number, number>, N_total: number): number {
        const totalDistributed = Object.values(classEmissions).reduce((sum, val) => sum + val, 0);
        return N_total > 0 ? totalDistributed / N_total : 0;
    }

    static summary(day: number, N_total: number) {
        const E_d = this.getDailyEmission(day);
        const activeClasses = this.getActiveClasses(N_total);
        const { classEmissions, reserveTotal } = this.calculateClassEmissions(E_d, activeClasses);
        const rewardPerNode = this.getPerNodeReward(classEmissions, N_total);

        return {
            day,
            emission: Math.floor(E_d),
            nodes: N_total,
            activeClasses,
            classEmissions: Object.fromEntries(
                Object.entries(classEmissions).map(([c, v]) => [c, Math.floor(v)])
            ),
            reserve: Math.floor(reserveTotal),
            rewardPerNode: parseFloat(rewardPerNode.toFixed(2)),
        };
    }
}
