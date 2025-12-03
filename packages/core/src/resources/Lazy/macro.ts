import { ElementType } from "../../types";

/**
 * Build-time macro for lazy loading components
 * This function is replaced during build by the Vite plugin
 *
 * @example
 * ```ts
 * // Input:
 * Lazy("./features/contacts#ContactPage", {
 *  loading: () => <div>Loading...</div>,
 *  error: (error) => <div>Error {error.message}...</div>
 * });
 *
 * // Output (after transformation):
 * (() => {
 *   @Route("/contacts")
 *   class LazyContactPage extends Component {
 *     renderLoading() {
 *       return <div>Loading...</div>;
 *     }
 *
 *     renderError(error: Error) {
 *       return <div>Error {error.message}...</div>;
 *     }
 *
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
export function Lazy(
  path: string,
  options?: { loading?: () => ElementType; error?: (error: any) => ElementType }
): any {
  throw new Error(
    `Lazy("${path}") must be transformed by the Vite plugin. ` +
      `Make sure @mini/vite-plugin is configured with lazyTransform enabled.`
  );
}
