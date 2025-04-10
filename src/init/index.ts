import mongoose from "mongoose";
import { seedingSetting } from "./setting.seed";
import { seedingAdmin } from "./admin.seed";

(async () => {
    if (mongoose.connections.length > 0) {
        const { MIGRATE_SETTING, MIGRATE_ADMIN } = process.env;
        if (MIGRATE_SETTING) {
            await seedingSetting();
        }

        if(MIGRATE_ADMIN){
            await seedingAdmin();
        }

    }
})();