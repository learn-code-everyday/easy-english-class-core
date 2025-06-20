export class EmissionHelper {
    static readonly TOTAL_EMISSION = 5_000_000_000;
    static readonly HALVING_INTERVAL_DAYS = 730;
    static readonly TOTAL_HALVING_PERIODS = 10;
    static readonly MAX_CLASSES = 5;
    static readonly CLASS_CAPACITY = 2000;
    static readonly SECONDS_PER_DAY = 86400;

    static readonly CLASS_WEIGHTS = [1, 2, 4, 8, 16];
    static readonly TOTAL_WEIGHT = EmissionHelper.CLASS_WEIGHTS.reduce((a, b) => a + b, 0); // 31

    /**
     * Returns how many miners are in each class (1 → 5)
     */
    static getMinerCountPerClass(N_total: number): Record<number, number> {
        const result: Record<number, number> = {};
        for (let c = 1; c <= this.MAX_CLASSES; c++) {
            const lower = (c - 1) * this.CLASS_CAPACITY;
            const upper = c * this.CLASS_CAPACITY;
            result[c] = Math.max(0, Math.min(N_total, upper) - lower);
        }
        return result;
    }

    /**
     * Returns the emission per day based on halving schedule
     */
    static getDailyEmission(day: number): number {
        const period = Math.min(Math.floor(day / this.HALVING_INTERVAL_DAYS), this.TOTAL_HALVING_PERIODS);
        const A = this.TOTAL_EMISSION / ((1 - Math.pow(0.5, this.TOTAL_HALVING_PERIODS + 1)) / (1 - 0.5));
        return A * Math.pow(0.5, period) / this.HALVING_INTERVAL_DAYS;
    }

    /**
     * Calculate class total emissions based on E_d and active miners
     */
    static calculateClassEmissions(
        E_d: number,
        minerCounts: Record<number, number>
    ): { classEmissions: Record<number, number>; reservePool: number } {
        const baseTotal = 0.1 * E_d;
        const variableTotal = 0.9 * E_d;
        const basePerClass = baseTotal / this.MAX_CLASSES;

        const classEmissions: Record<number, number> = {};
        let reservePool = 0;

        for (let c = 1; c <= this.MAX_CLASSES; c++) {
            const minersInClass = minerCounts[c];
            const weight = this.CLASS_WEIGHTS[c - 1];

            if (minersInClass > 0) {
                const variablePart = (weight / this.TOTAL_WEIGHT) * variableTotal;
                classEmissions[c] = basePerClass + variablePart;
            } else {
                const variablePart = (weight / this.TOTAL_WEIGHT) * variableTotal;
                reservePool += basePerClass + variablePart;
                classEmissions[c] = 0;
            }
        }

        return { classEmissions, reservePool };
    }

    /**
     * Get token/sec per miner for each class
     */
    static getSpeedPerMiner(E_d: number, N_total: number): Record<number, number> {
        const minerCounts = this.getMinerCountPerClass(N_total);
        const { classEmissions } = this.calculateClassEmissions(E_d, minerCounts);

        const speeds: Record<number, number> = {};
        for (let c = 1; c <= this.MAX_CLASSES; c++) {
            const miners = minerCounts[c];
            const emission = classEmissions[c];
            speeds[c] = miners > 0 ? emission / this.SECONDS_PER_DAY / miners : 0;
        }
        return speeds;
    }

    /**
     * Get token/sec per miner for each class
     */
    static getClassIndexByMinerPosition(position: number): number {
        return Math.floor(position / this.CLASS_CAPACITY) + 1;
    }

    static calculateEmission(E_d: number, totalMiners: number): Array<{
        class: number;
        miners: number;
        emission: number;
        tokensPerSecondPerMiner: number;
    }> {
        const minerCounts = this.getMinerCountPerClass(totalMiners);
        const { classEmissions } = this.calculateClassEmissions(E_d, minerCounts);

        const result: Array<{
            class: number;
            miners: number;
            emission: number;
            tokensPerSecondPerMiner: number;
        }> = [];

        for (let c = 1; c <= this.MAX_CLASSES; c++) {
            const miners = minerCounts[c];
            const emission = classEmissions[c];
            const tokensPerSecondPerMiner = miners > 0 ? emission / this.SECONDS_PER_DAY / miners : 0;

            result.push({
                class: c,
                miners,
                emission: Math.round(emission),
                tokensPerSecondPerMiner: parseFloat(tokensPerSecondPerMiner.toFixed(4))
            });
        }

        return result;
    }

    static calculateMinerEmissions(
        totalEmission: number,
        totalMiners: number,
    ): any {
        const rewardMultipliers = Array.from({ length: this.MAX_CLASSES }, (_, i) => Math.pow(2, i));
        const classMinerCounts = Array.from({ length: this.MAX_CLASSES }, (_, i) => {
            const remaining = totalMiners - i * this.CLASS_CAPACITY;
            return Math.max(0, Math.min(this.CLASS_CAPACITY, remaining));
        });
        const totalWeight = classMinerCounts.reduce(
            (sum, miners, i) => sum + miners * rewardMultipliers[i],
            0
        );
        const SECONDS_PER_DAY = 86400;
        const DAYS = 365; // 1 year
        const results: any = [];

        for (let i = 0; i < this.MAX_CLASSES; i++) {
            const miners = classMinerCounts[i];
            const multiplier = rewardMultipliers[i];
            const weight = miners * multiplier;
            const emission = (weight / totalWeight) * totalEmission;
            const tokensPerSecondPerMiner =
                miners > 0 ? emission / (DAYS * SECONDS_PER_DAY * miners) : 0;

            results.push({
                class: i + 1,
                miners,
                emission: Math.round(emission),
                tokensPerSecondPerMiner: parseFloat(tokensPerSecondPerMiner.toFixed(4)),
            });
        }

        return results;
    }

    static getRewardPerSecond(position: number, totalMiners: number, days: number): number {
        const E_d = this.getDailyEmission(days)
        const classIndex = this.getClassIndexByMinerPosition(position);
        if (classIndex > this.MAX_CLASSES) return 0;

        const minerCounts = this.getMinerCountPerClass(totalMiners);
        const { classEmissions } = this.calculateClassEmissions(E_d, minerCounts);
        const emission = classEmissions[classIndex];
        const minersInClass = minerCounts[classIndex];

        if (!minersInClass || !emission) return 0;

        console.log(123123, emission )
        console.log(123123, this.SECONDS_PER_DAY )
        console.log(123123, minersInClass )

        return emission / this.SECONDS_PER_DAY / minersInClass;
    }
}
