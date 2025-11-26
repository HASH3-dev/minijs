/**
 * Presets de estilos para ViewTransition
 * Estilos prontos para transições comuns
 */

export interface TransitionPreset {
  name: string;
  description: string;
  css: string;
}

export const ViewTransitionPresets = {
  /**
   * Transição padrão - fade simples
   */
  fade: {
    name: "Fade",
    description: "Simple fade in/out transition",
    css: `
      ::view-transition-old({{tag}}),
      ::view-transition-new({{tag}}) {
        animation-fill-mode: both;
        mix-blend-mode: normal;
        backface-visibility: hidden;
      }
      ::view-transition-old({{tag}}) {
        animation: fade-out 0.3s ease-out;
      }
      ::view-transition-new({{tag}}) {
        animation: fade-in 0.3s ease-in;
      }
      ::view-transition-group({{tag}}) {
        isolation: isolate;
      }
      @keyframes fade-out {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `,
  },

  /**
   * Transição de posição + escala (Hero padrão)
   */
  hero: {
    name: "Hero",
    description: "Position and scale transition (like Flutter Hero)",
    css: `
      ::view-transition-old({{tag}}),
      ::view-transition-new({{tag}}) {
        animation-duration: 0.4s;
        animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        animation-fill-mode: both;
        mix-blend-mode: normal;
        backface-visibility: hidden;
        overflow: clip;
      }

      ::view-transition-group({{tag}}) {
        isolation: isolate;
      }

      ::view-transition-image-pair({{tag}}) {
        isolation: isolate;
      }

      ::view-transition-old({{tag}}),
      ::view-transition-new({{tag}}) {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    `,
  },

  /**
   * Escala com fade
   */
  scaleUp: {
    name: "Scale Up",
    description: "Scale up with fade",
    css: `
      ::view-transition-old({{tag}}),
      ::view-transition-new({{tag}}) {
        animation-fill-mode: both;
        mix-blend-mode: normal;
        backface-visibility: hidden;
      }
      ::view-transition-old({{tag}}) {
        animation: scale-down-fade 0.3s ease-out;
      }
      ::view-transition-new({{tag}}) {
        animation: scale-up-fade 0.3s ease-in;
      }
      ::view-transition-group({{tag}}) {
        isolation: isolate;
      }
      @keyframes scale-down-fade {
        from {
          opacity: 1;
          transform: scale(1);
        }
        to {
          opacity: 0;
          transform: scale(0.8);
        }
      }
      @keyframes scale-up-fade {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `,
  },

  /**
   * Slide da esquerda
   */
  slideLeft: {
    name: "Slide Left",
    description: "Slide from right to left",
    css: `
      ::view-transition-old({{tag}}),
      ::view-transition-new({{tag}}) {
        animation-fill-mode: both;
        mix-blend-mode: normal;
        backface-visibility: hidden;
        will-change: transform, opacity;
        transform: translateZ(0);
      }
      ::view-transition-old({{tag}}) {
        animation: slide-out-left 0.3s ease-out;
      }
      ::view-transition-new({{tag}}) {
        animation: slide-in-left 0.3s ease-in;
      }
      ::view-transition-group({{tag}}) {
        isolation: isolate;
      }
      ::view-transition-image-pair({{tag}}) {
        isolation: isolate;
      }
      @keyframes slide-out-left {
        from {
          transform: translateX(0) translateZ(0);
          opacity: 1;
        }
        to {
          transform: translateX(-100%) translateZ(0);
          opacity: 0;
        }
      }
      @keyframes slide-in-left {
        from {
          transform: translateX(100%) translateZ(0);
          opacity: 0;
        }
        to {
          transform: translateX(0) translateZ(0);
          opacity: 1;
        }
      }
    `,
  },

  /**
   * Slide da direita
   */
  slideRight: {
    name: "Slide Right",
    description: "Slide from left to right",
    css: `
      ::view-transition-old({{tag}}),
      ::view-transition-new({{tag}}) {
        animation-fill-mode: both;
        mix-blend-mode: normal;
        backface-visibility: hidden;
      }
      ::view-transition-old({{tag}}) {
        animation: slide-out-right 0.3s ease-out;
      }
      ::view-transition-new({{tag}}) {
        animation: slide-in-right 0.3s ease-in;
      }
      ::view-transition-group({{tag}}) {
        isolation: isolate;
      }
      @keyframes slide-out-right {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      @keyframes slide-in-right {
        from {
          transform: translateX(-100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `,
  },

  /**
   * Zoom in
   */
  zoomIn: {
    name: "Zoom In",
    description: "Zoom in effect",
    css: `
      ::view-transition-old({{tag}}),
      ::view-transition-new({{tag}}) {
        animation-fill-mode: both;
        mix-blend-mode: normal;
        backface-visibility: hidden;
      }
      ::view-transition-old({{tag}}) {
        animation: zoom-out 0.3s ease-out;
      }
      ::view-transition-new({{tag}}) {
        animation: zoom-in 0.3s ease-in;
      }
      ::view-transition-group({{tag}}) {
        isolation: isolate;
      }
      @keyframes zoom-out {
        from {
          opacity: 1;
          transform: scale(1);
        }
        to {
          opacity: 0;
          transform: scale(1.5);
        }
      }
      @keyframes zoom-in {
        from {
          opacity: 0;
          transform: scale(0.5);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `,
  },

  /**
   * Flip horizontal
   */
  flipX: {
    name: "Flip X",
    description: "Flip horizontally",
    css: `
      ::view-transition-old({{tag}}),
      ::view-transition-new({{tag}}) {
        animation-fill-mode: both;
        mix-blend-mode: normal;
        backface-visibility: hidden;
      }
      ::view-transition-old({{tag}}) {
        animation: flip-out-x 0.4s ease-out;
      }
      ::view-transition-new({{tag}}) {
        animation: flip-in-x 0.4s ease-in;
      }
      ::view-transition-group({{tag}}) {
        isolation: isolate;
      }
      @keyframes flip-out-x {
        from {
          opacity: 1;
          transform: rotateY(0deg);
        }
        to {
          opacity: 0;
          transform: rotateY(90deg);
        }
      }
      @keyframes flip-in-x {
        from {
          opacity: 0;
          transform: rotateY(-90deg);
        }
        to {
          opacity: 1;
          transform: rotateY(0deg);
        }
      }
    `,
  },

  /**
   * Bounce
   */
  bounce: {
    name: "Bounce",
    description: "Bouncing effect",
    css: `
      ::view-transition-old({{tag}}),
      ::view-transition-new({{tag}}) {
        animation-fill-mode: both;
        mix-blend-mode: normal;
        backface-visibility: hidden;
      }
      ::view-transition-old({{tag}}) {
        animation: bounce-out 0.4s ease-out;
      }
      ::view-transition-new({{tag}}) {
        animation: bounce-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }
      ::view-transition-group({{tag}}) {
        isolation: isolate;
      }
      @keyframes bounce-out {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.1);
          opacity: 0.5;
        }
        100% {
          transform: scale(0);
          opacity: 0;
        }
      }
      @keyframes bounce-in {
        0% {
          transform: scale(0);
          opacity: 0;
        }
        50% {
          transform: scale(1.1);
          opacity: 0.5;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
    `,
  },

  /**
   * Rotate + Scale
   */
  rotate: {
    name: "Rotate",
    description: "Rotate with scale effect",
    css: `
      ::view-transition-old({{tag}}),
      ::view-transition-new({{tag}}) {
        animation-fill-mode: both;
        mix-blend-mode: normal;
        backface-visibility: hidden;
      }
      ::view-transition-old({{tag}}) {
        animation: rotate-out 0.4s ease-out;
      }
      ::view-transition-new({{tag}}) {
        animation: rotate-in 0.4s ease-in;
      }
      ::view-transition-group({{tag}}) {
        isolation: isolate;
      }
      @keyframes rotate-out {
        from {
          opacity: 1;
          transform: rotate(0deg) scale(1);
        }
        to {
          opacity: 0;
          transform: rotate(-180deg) scale(0.5);
        }
      }
      @keyframes rotate-in {
        from {
          opacity: 0;
          transform: rotate(180deg) scale(0.5);
        }
        to {
          opacity: 1;
          transform: rotate(0deg) scale(1);
        }
      }
    `,
  },

  /**
   * Sem transição
   */
  none: {
    name: "None",
    description: "No transition",
    css: `
      ::view-transition-old({{tag}}),
      ::view-transition-new({{tag}}) {
        animation: none;
      }
    `,
  },
} as const;

export type ViewTransitionPresetName = keyof typeof ViewTransitionPresets;

/**
 * Aplica um preset de transição
 */
export function applyPreset(
  tag: string,
  preset: ViewTransitionPresetName | TransitionPreset
): string {
  const presetObj =
    typeof preset === "string" ? ViewTransitionPresets[preset] : preset;

  return presetObj.css.replace(/\{\{tag\}\}/g, tag);
}
