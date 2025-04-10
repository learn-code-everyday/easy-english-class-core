import chalk from "chalk";
import { CrudService } from "../../../base/crudService";
import { SETTING_DATA } from "../../../configs/settingData";
import { SettingGroupModel } from "../settingGroup/settingGroup.model";
import { SettingModel } from "./setting.model";

class SettingService extends CrudService<typeof SettingModel> {
  constructor() {
    super(SettingModel);
  }

  async seedingSetting() {
    const settingGroups = await SettingGroupModel.find({}, { slug: 1, _id: 1 }).limit(1000);
    const settings = await this.model.find({}, { key: 1, name: 1 }).limit(1000);
    console.log(chalk.redBright("🚣 Generate Settings \n"));
    for (const GROUP of SETTING_DATA) {
      let settingGroup = settingGroups.find((g: any) => g.slug == GROUP.slug);
      if (!settingGroup) {
        console.log("⛳ Setting Adding : ", GROUP.name);
        settingGroup = await SettingGroupModel.create({
          slug: GROUP.slug,
          name: GROUP.name,
          desc: GROUP.desc,
          icon: GROUP.icon,
          readOnly: GROUP.readOnly,
          // settingIds: [],
        });
      }

      for (const SETTING of GROUP.settings) {
        // console.log("SETTING.key", SETTING.key);
        let setting = settings.find((s: any) => s.key == SETTING.key);
        if (setting) {
          console.log("⛳ Existed Setting : ", SETTING.name);
        } else {
          console.log("⛳ New setting : ", SETTING.name);
          setting = await SettingModel.create({
            ...SETTING,
            groupId: settingGroup._id.toString(),
          });
          //settingGroup.settingIds.push(setting._id);
        }
        //SettingKeyLoader.prime(setting.key, setting);
      }
      await settingGroup.save();
    }
  }
}

const settingService = new SettingService();

export { settingService };
