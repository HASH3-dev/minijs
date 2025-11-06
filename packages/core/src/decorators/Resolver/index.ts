import "reflect-metadata";
import { RESOLVERS_METADATA } from "./constants";
import { ResolverType } from "./types";

/**
 * Decorator to load data before rendering component
 * Resolved data is made available via DI using resolver class as token
 *
 * The actual resolver execution is handled by ResolverDecoratorPlugin
 * which runs in the Created lifecycle phase
 *
 * @param resolvers Array of resolver instances or classes
 * @example
 * // Define resolver
 * class UserResolver implements Resolver<User> {
 *   resolve(): Observable<User> {
 *     return this.http.get<User>('/api/user');
 *   }
 *
 *   // Optional: custom isEmpty logic
 *   isEmpty(data: User): boolean {
 *     return !data || !data.id;
 *   }
 * }
 *
 * // Use in component
 * @UseResolvers([UserResolver, PostsResolver])
 * export class UserPage extends Component {
 *   @Inject(UserResolver) user!: User;
 *   @Inject(PostsResolver) posts!: Posts[];
 *
 *   render() {
 *     // Only called when all resolvers succeed
 *     return <div>User: {this.user.name}</div>;
 *   }
 *
 *   renderLoading() {
 *     return <div>Loading...</div>;
 *   }
 *
 *   renderError() {
 *     return <div>Error loading data</div>;
 *   }
 *
 *   renderEmpty() {
 *     return <div>No data available</div>;
 *   }
 * }
 */
export function UseResolvers(resolvers: ResolverType[]) {
  return function <T extends new (...args: any[]) => any>(target: T) {
    // Store metadata on prototype for ResolverPlugin to read
    Reflect.defineMetadata(RESOLVERS_METADATA, resolvers, target.prototype);
    return target;
  };
}

// Re-export types
export type {
  Resolver,
  ResolverClass,
  ResolverType,
  ResolvedData,
} from "./types";
export { RenderState } from "../../types";
export { RESOLVERS_METADATA } from "./constants";
