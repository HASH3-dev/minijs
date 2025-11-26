import { Injectable } from "@mini/core";
import { ThemeService } from "./ThemeService.Abstract";

@Injectable()
export class DarkTheme extends ThemeService {
  getCardClass(): string {
    return "bg-slate-800 border-slate-700 text-white";
  }

  getTextClass(): string {
    return "text-slate-300";
  }

  getButtonClass(): string {
    return "bg-slate-700 hover:bg-slate-600 text-white";
  }

  getThemeName(): string {
    return "🌙 Dark Theme";
  }
}
