import { SettingTypes } from "../graphql/modules/setting/setting.model";

export enum SettingGroupSlug {
  COMMON = "COMMON",
  WEBSITE_SETTING = "WEBSITE_SETTING",
}
export enum SettingKey {
  // Cấu hình chung
  TITLE = "TITLE",
  WEBSITE_DOMAIN = "WEBSITE_DOMAIN",
  API_DOMAIN = "API_DOMAIN",
  MEDIA_DOMAIN = "MEDIA_DOMAIN",
  LOGO_URL = "LOGO_URL",
  MAINTENANCE = "MAINTENANCE",

  // cấu hình website
  USE_MENU_CATEGORY = "USE_MENU_CATEGORY",
  ADMIN_MENU = "ADMIN_MENU",

  MINER_UNIT_PRICE = "MINER_UNIT_PRICE",
  SELLER_COMMISSIONS_RATE = "SELLER_COMMISSIONS_RATE",
  MERCHANT_COMMISSIONS_RATE = "MERCHANT_COMMISSIONS_RATE",
}

export const SETTING_DATA = [
  {
    slug: SettingGroupSlug.COMMON,
    name: "Common setting",
    desc: "Common setting here",
    icon: "FcSettings",
    readOnly: true,
    settings: [
      {
        type: SettingTypes.string,
        name: "Website Title",
        key: SettingKey.TITLE,
        value: `botanika.ai`,
        isActive: true,
        isPrivate: false,
        readOnly: false,
      },
      {
        type: SettingTypes.string,
        name: "Website Domain",
        key: SettingKey.WEBSITE_DOMAIN,
        value: `http://botanika.ai/`,
        isActive: true,
        isPrivate: false,
        readOnly: false,
      },
      {
        type: SettingTypes.string,
        name: "Logo url",
        key: SettingKey.LOGO_URL,
        value: `/images/logo.png`,
        isActive: true,
        isPrivate: false,
        readOnly: false,
      },
      {
        type: SettingTypes.boolean,
        name: "Maintenance",
        key: SettingKey.MAINTENANCE,
        value: false,
        isActive: true,
        isPrivate: false,
        readOnly: false,
      },
    ],
  },

];
