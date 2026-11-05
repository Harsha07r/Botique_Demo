import { aboutPage, contactPage, homePage, policyPage, siteSettings } from "./pages";
import { product } from "./product";

export const schemaTypes = [product, siteSettings, homePage, aboutPage, contactPage, policyPage];
export const SINGLETONS = ["siteSettings", "homePage", "aboutPage", "contactPage", "policyPage"] as const;
