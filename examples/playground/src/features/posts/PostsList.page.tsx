import { Component, Inject, LoadData, Mount, signal } from "@mini/core";
import { Link, Route } from "@mini/router";
import { interval, tap } from "rxjs";
import { PostCard } from "./components/PostCard/PostCard.component";
import { PostsApiService } from "./services/PostsApi.service";
import type { Post } from "./types";

/**
 * PostsList - Página que lista todos os posts
 */
@Route("/posts")
export class PostsListPage extends Component {
  @Inject(PostsApiService) private api!: PostsApiService;

  private posts = signal<Post[]>([]);

  @Mount()
  onMount() {
    return interval(10000).pipe(tap(() => this.fetchPostsOnce()));
  }

  @Mount()
  onMount2() {
    return this.api.getPosts$().pipe(
      tap((result) => {
        this.posts.set(result.data);
      })
    );
  }

  @Mount()
  @LoadData()
  async loadPosts() {
    return this.fetchPostsOnce();
  }

  private async fetchPostsOnce() {
    const result = await this.api.getPosts();
    this.posts.set(result.data);
  }

  // @LoadData()
  async handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja deletar este post?")) return;

    await this.api.deletePost(id);
    // Remove o post da lista (aqui podemos usar .value porque não é no JSX)
    // this.posts.set(this.posts.value.filter((p) => p.id !== id));
  }

  renderLoading() {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-blue-600">Carregando...</div>
      </div>
    );
  }

  renderError() {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-red-600">Erro ao carregar posts</div>
      </div>
    );
  }

  render() {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 to-blue-100 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              📝 Posts CRUD
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Exemplo completo de CRUD com HTTPService + Dependency Injection
            </p>
            <Link
              href="/posts/create"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              ➕ Criar Novo Post
            </Link>
          </div>

          {/* Posts List */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              📋 Lista de Posts ({this.posts.length()})
            </h2>

            <div className="space-y-4">
              {this.posts
                .map((post) => {
                  return (
                    <PostCard
                      // key={post.id}
                      post={post}
                      onDelete={(id) => this.handleDelete(id)}
                    />
                  );
                })
                .orElse(() => (
                  <div className="text-center text-gray-500 py-12">
                    <p className="text-lg">Nenhum post encontrado</p>
                    <p className="mt-2">
                      Clique em "Criar Novo Post" para adicionar
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              ℹ️ Sobre este exemplo
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-gray-600">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  🏗️ Arquitetura
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>HTTPService com adapter pattern</li>
                  <li>Dependency Injection com @Injectable</li>
                  <li>Reactive programming com Signals e RxJS</li>
                  <li>Form validation com class-validator</li>
                  <li>@LoadData para loading states</li>
                  <li>Componentes reutilizáveis</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">🔗 API</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>JSONPlaceholder (REST API pública)</li>
                  <li>GET /posts - Lista posts</li>
                  <li>POST /posts - Cria post</li>
                  <li>PUT /posts/:id - Atualiza post</li>
                  <li>DELETE /posts/:id - Deleta post</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
