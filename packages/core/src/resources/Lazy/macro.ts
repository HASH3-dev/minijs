/**
 * Build-time macro for lazy loading components
 * This function is replaced during build by the Vite plugin
 *
 * @example
 * ```ts
 * // Input:
 * Lazy("./features/contacts#ContactPage")
 *
 * // Output (after transformation):
 * (() => {
 *   @Route("/contacts")
 *   class LazyContactPage extends Component {
 *     render() {
 *       return import("./features/contacts").then((m) => (
 *         <m.ContactPage />
 *       ));
 *     }
 *   }
 *   return LazyContactPage;
 * })()
 * ```
 */
export function Lazy(path: string): any {
  throw new Error(
    `Lazy("${path}") must be transformed by the Vite plugin. ` +
      `Make sure @mini/vite-plugin is configured with lazyTransform enabled.`
  );
}
