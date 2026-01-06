import {
  Component,
  Inject,
  LoadData,
  LoadFragment,
  Mount,
  RenderState,
  signal,
} from "@mini/core";
import { Route, RouterService } from "@mini/router";
import { UseForm } from "@mini/forms";
import type { FormController } from "@mini/forms";
import { PostsApiService } from "./services/PostsApi.service";
import { PostForm } from "./components/PostForm/PostForm.component";
import {
  PostFormSchema as PostFormSchemaClass,
  type Post,
  type PostFormSchema,
} from "./types";

/**
 * PostEdit - Página para editar um post existente
 */
@Route("/posts/:id/edit")
export class PostEditPage extends Component {
  @Inject(PostsApiService) private api!: PostsApiService;
  @Inject(RouterService) private router!: RouterService;

  @UseForm(PostFormSchemaClass)
  private form!: FormController<PostFormSchema>;

  private post = signal<Post | null>(null);

  @Mount()
  onMount() {
    this.loadPost();
  }

  @LoadData()
  async loadPost() {
    const id = parseInt(this.router.params.id);
    if (isNaN(id)) {
      this.router.replace("/posts");
      return;
    }

    try {
      const result = await this.api.getPost(id);
      const post = result.data;

      if (!post) {
        this.router.replace("/posts");
        return;
      }

      this.post.set(post);

      // Preenche o formulário com os dados do post
      this.form.setValues({
        title: post.title,
        body: post.body,
      });
    } catch (error) {
      this.router.replace("/posts");
      return;
    }
  }

  @LoadData()
  async handleSubmit(e: Event) {
    e.preventDefault();

    const currentPost = this.post.value;
    if (!currentPost) return;

    if (!(await this.form.isValid$)) return;

    const formData = await this.form.values$;
    await this.api.updatePost(currentPost.id, formData as PostFormSchema);

    // Redireciona para a lista de posts
    this.router.push("/posts");
  }

  handleCancel() {
    this.router.push("/posts");
  }

  renderLoading() {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-blue-600">Carregando...</div>
      </div>
    );
  }

  render() {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ✏️ Editar Post
            </h1>
            {this.post.map((post) => (
              <p className="text-lg text-gray-600">Editando post #{post?.id}</p>
            ))}
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <PostForm
              form={this.form}
              onSubmit={(e) => this.handleSubmit(e)}
              onCancel={() => this.handleCancel()}
              submitLabel="Salvar Alterações"
            />
          </div>

          {/* Info */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Este exemplo usa <strong>Route Params</strong> para capturar o ID
              da URL
            </p>
          </div>
        </div>
      </div>
    );
  }
}
