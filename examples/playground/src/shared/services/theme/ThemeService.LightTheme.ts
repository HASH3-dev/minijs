import { Injectable } from "@mini/core";
import { ThemeService } from "./ThemeService.Abstract";

@Injectable()
export class LightTheme extends ThemeService {
  getCardClass(): string {
    return "bg-white border-slate-300 text-slate-900";
  }

  getTextClass(): string {
    return "text-slate-600";
  }

  getButtonClass(): string {
    return "bg-slate-100 hover:bg-slate-200 text-slate-900";
  }

  getThemeName(): string {
    return "☀️ Light Theme";
  }
}
