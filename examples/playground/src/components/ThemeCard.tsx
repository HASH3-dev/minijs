import { Component } from "@mini/core";
import { Inject } from "@mini/di";
import { ThemeService } from "../services/theme/ThemeService.Abstract";

export class ThemedCard extends Component {
  @Inject(ThemeService) theme!: ThemeService;

  render() {
    const cardClass = this.theme.getCardClass();
    const textClass = this.theme.getTextClass();
    const buttonClass = this.theme.getButtonClass();

    return (
      <div class={`rounded-xl shadow-lg p-6 border-2 ${cardClass}`}>
        <h3 class="text-2xl font-bold mb-2">{this.theme.getThemeName()}</h3>
        <p class={`mb-4 ${textClass}`}>
          This card uses the injected ThemeService to determine its styling.
        </p>
        <div class="space-y-2">
          <div class={`p-3 rounded-lg border ${buttonClass}`}>
            <p class="text-sm font-medium">
              Card Class:{" "}
              <code class="text-xs">{cardClass.substring(0, 30)}...</code>
            </p>
          </div>
          <div class={`p-3 rounded-lg border ${buttonClass}`}>
            <p class="text-sm font-medium">
              Text Class: <code class="text-xs">{textClass}</code>
            </p>
          </div>
        </div>
      </div>
    );
  }
}
