import { Component, Inject, LoadData } from "@mini/core";
import { Route, RouterService } from "@mini/router";
import { FormTrigger, UseForm } from "@mini/forms";
import type { FormController } from "@mini/forms";
import { PostsApiService } from "./services/PostsApi.service";
import { PostForm } from "./components/PostForm/PostForm.component";
import {
  PostFormSchema as PostFormSchemaClass,
  type PostFormSchema,
} from "./types";

/**
 * PostCreate - Página para criar um novo post
 */
@Route("/posts/create")
export class PostCreatePage extends Component {
  @Inject(PostsApiService) private api!: PostsApiService;
  @Inject(RouterService) private router!: RouterService;

  @UseForm(PostFormSchemaClass, { trigger: FormTrigger.blur })
  private form!: FormController<PostFormSchema>;

  @LoadData()
  async handleSubmit(e: Event) {
    e.preventDefault();
    console.log(this.form);

    if (!(await this.form.isValid$)) return;

    const formData = await this.form.values$;
    const result = await this.api.createPost(formData as PostFormSchema);

    console.log("Post criado com sucesso:", result);
    // Redireciona para a lista de posts
    this.router.push("/posts");
  }

  handleCancel() {
    this.router.push("/posts");
  }

  renderLoading() {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-blue-600">Salvando...</div>
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
              ➕ Criar Novo Post
            </h1>
            <p className="text-lg text-gray-600">
              Preencha os campos abaixo para criar um novo post
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <PostForm
              form={this.form}
              onSubmit={(e) => this.handleSubmit(e)}
              onCancel={() => this.handleCancel()}
              submitLabel="Criar Post"
            />
          </div>

          {/* Info */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Este exemplo usa <strong>HTTPService</strong> com{" "}
              <strong>Dependency Injection</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }
}
