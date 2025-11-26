import { Component, Mount, signal } from "@mini/core";
import {
  ViewTransition,
  ViewTransitionPresets,
  withViewTransition,
} from "@mini/common";

export class ViewTransitionPresetsExample extends Component {
  private selectedPreset = signal<keyof typeof ViewTransitionPresets>("hero");
  private showDetail = signal(false);

  presets = Object.keys(ViewTransitionPresets) as Array<
    keyof typeof ViewTransitionPresets
  >;

  async openDetail(preset: keyof typeof ViewTransitionPresets) {
    await withViewTransition(() => {
      this.showDetail.set(true);
      this.selectedPreset.set(preset);
    });
  }

  async closeDetail() {
    await withViewTransition(() => {
      this.showDetail.set(false);
    });
  }

  render() {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">
          ViewTransition Presets Gallery 🎨
        </h2>

        <p className="text-slate-600 mb-6">
          Clique em qualquer card para ver a transição em ação! Cada preset tem
          um estilo diferente.
        </p>

        {this.showDetail.map((show) =>
          show ? (
            // Detail View
            <div className="min-h-[400px]">
              {this.selectedPreset.map((preset) => {
                const presetInfo =
                  ViewTransitionPresets[
                    preset as keyof typeof ViewTransitionPresets
                  ];
                return (
                  <div>
                    <button
                      onClick={() => this.closeDetail()}
                      className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Back to Gallery
                    </button>

                    <ViewTransition
                      tag={`preset-${String(preset)}`}
                      preset={preset as keyof typeof ViewTransitionPresets}
                      duration={400}
                    >
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-8 text-white shadow-2xl">
                        <h3 className="text-3xl font-bold mb-2">
                          {presetInfo.name}
                        </h3>
                        <p className="text-blue-100 text-lg">
                          {presetInfo.description}
                        </p>
                      </div>
                    </ViewTransition>

                    <div className="mt-6 p-6 bg-slate-50 rounded-lg border border-slate-200">
                      <h4 className="text-lg font-semibold mb-3 text-slate-800">
                        Como usar:
                      </h4>
                      <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                        {`<ViewTransition
  tag="my-element"
  preset="${String(preset)}"
  duration={400}
>
  <div>Your content here</div>
</ViewTransition>`}
                      </pre>

                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          💡 <strong>Dica:</strong> Use o mesmo{" "}
                          <code className="bg-yellow-100 px-1 rounded">
                            tag
                          </code>{" "}
                          em diferentes páginas para criar transições Hero como
                          no Flutter!
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {this.presets.map((preset) => {
                const presetInfo = ViewTransitionPresets[preset];
                return (
                  <ViewTransition
                    tag={`preset-${String(preset)}`}
                    preset={preset as keyof typeof ViewTransitionPresets}
                    duration={400}
                  >
                    <button
                      onClick={() => this.openDetail(preset)}
                      className="group bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer text-left w-full"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold group-hover:scale-110 transition-transform">
                          {presetInfo.name}
                        </h3>
                        <svg
                          className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                      <p className="text-blue-100 text-sm">
                        {presetInfo.description}
                      </p>
                    </button>
                  </ViewTransition>
                );
              })}
            </div>
          )
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">
            📚 Presets Disponíveis:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • <strong>hero</strong> - Transição padrão de posição e escala
              (como Flutter)
            </li>
            <li>
              • <strong>fade</strong> - Fade simples in/out
            </li>
            <li>
              • <strong>scaleUp</strong> - Escala com fade
            </li>
            <li>
              • <strong>slideLeft/slideRight</strong> - Slides laterais
            </li>
            <li>
              • <strong>zoomIn</strong> - Efeito de zoom
            </li>
            <li>
              • <strong>flipX</strong> - Flip horizontal
            </li>
            <li>
              • <strong>bounce</strong> - Efeito bouncing
            </li>
            <li>
              • <strong>rotate</strong> - Rotação com escala
            </li>
            <li>
              • <strong>none</strong> - Sem transição
            </li>
          </ul>
        </div>
      </div>
    );
  }
}
