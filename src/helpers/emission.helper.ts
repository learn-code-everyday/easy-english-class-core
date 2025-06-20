export class EmissionHelper {
    static readonly TOTAL_EMISSION = 5_000_000_000; // 5B total supply
    static readonly HALVING_INTERVAL_DAYS = 730;
    static readonly TOTAL_HALVING_PERIODS = 10;
    static readonly MAX_CLASSES = 5;
    static readonly CLASS_CAPACITY = 2000;
    static readonly SECONDS_PER_DAY = 86400;

    static readonly A: number = (EmissionHelper.TOTAL_EMISSION * 1024) / 2046;

    // Step 1: Daily emission
    static getDailyEmission(day: number): number {
        const halvingIndex = Math.floor(day / this.HALVING_INTERVAL_DAYS);
        if (halvingIndex >= this.TOTAL_HALVING_PERIODS) return 0;
        const dailyBase = this.A / this.HALVING_INTERVAL_DAYS;
        return dailyBase * Math.pow(0.5, halvingIndex);
    }

    // Step 2: Count miners per class
    static getMinerCountPerClass(N_total: number): Record<number, number> {
        const counts: Record<number, number> = {};
        for (let c = 1; c <= this.MAX_CLASSES; c++) {
            const lower = (c - 1) * this.CLASS_CAPACITY;
            const upper = c * this.CLASS_CAPACITY;
            counts[c] = Math.max(0, Math.min(N_total, upper) - lower);
        }
        return counts;
    }

    // Step 3: Calculate emissions per class
    static calculateClassEmissions(E_d: number): Record<number, number> {
        const emissions: Record<number, number> = {};
        for (let c = 1; c <= this.MAX_CLASSES; c++) {
            const base = 0.1 * E_d;
            const variable = 0.9 * E_d / Math.pow(2, this.MAX_CLASSES - c);
            emissions[c] = base + variable;
        }
        return emissions;
    }

    // Step 4: Calculate token/sec per miner per class
    static getSpeedPerMiner(
        E_d: number,
        N_total: number
    ): Record<number, number> {
        const minerCounts = this.getMinerCountPerClass(N_total);
        const classEmissions = this.calculateClassEmissions(E_d);

        const speed: Record<number, number> = {};
        for (let c = 1; c <= this.MAX_CLASSES; c++) {
            const miners = minerCounts[c];
            if (miners > 0) {
                speed[c] = classEmissions[c] / this.SECONDS_PER_DAY / miners;
            } else {
                speed[c] = 0;
            }
        }
        return speed;
    }

    // ✅ Step 5: Simulate mining over multiple days
    static simulateMining(
        numDays: number,
        N_total: number
    ): Array<{
        day: number;
        emission: number;
        rewardsPerMinerPerClass: Record<number, number>;
    }> {
        const results: Array<{
            day: number;
            emission: number;
            rewardsPerMinerPerClass: Record<number, number>;
        }> = [];

        for (let d = 0; d < numDays; d++) {
            const E_d = this.getDailyEmission(d);
            const speedPerMiner = this.getSpeedPerMiner(E_d, N_total);

            const dailyRewardPerMiner: Record<number, number> = {};
            for (let c = 1; c <= this.MAX_CLASSES; c++) {
                dailyRewardPerMiner[c] = speedPerMiner[c] * this.SECONDS_PER_DAY;
            }

            results.push({
                day: d,
                emission: E_d,
                rewardsPerMinerPerClass: dailyRewardPerMiner,
            });
        }

        return results;
    }

    static getTotalRewardAndSpeedForCustomer(seconds: number, N_total: number, customerMinerCount: number) {
        const dayStart = 0;
        const totalDays = Math.ceil(seconds / this.SECONDS_PER_DAY);

        let totalReward = 0;
        let lastSpeedPerMiner = 0;

        for (let d = dayStart; d < dayStart + totalDays; d++) {
            const E_d = this.getDailyEmission(d);
            const speedMap = this.getSpeedPerMiner(E_d, N_total);

            // Giả sử customer nằm ở class đầu tiên có slot trống (theo phân bổ sequentially)
            const classCounts = this.getMinerCountPerClass(N_total);
            let assignedClass = 1;
            for (let c = 1; c <= this.MAX_CLASSES; c++) {
                const maxClassSize = this.CLASS_CAPACITY;
                const currentCount = classCounts[c];
                if (currentCount < maxClassSize) {
                    assignedClass = c;
                    break;
                }
            }

            const speed = speedMap[assignedClass];
            const secondsThisDay = (d === totalDays - 1 && seconds % this.SECONDS_PER_DAY !== 0)
                ? seconds % this.SECONDS_PER_DAY
                : this.SECONDS_PER_DAY;

            totalReward += speed * secondsThisDay * customerMinerCount;
            lastSpeedPerMiner = speed;
        }

        return {
            totalEmission: totalReward,
            speedPerMiner: lastSpeedPerMiner
        };
    }
}
