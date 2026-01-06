import { Inject, Injectable, signal } from "@mini/core";
import { HTTPService } from "@mini/common";
import { exhaustMap, switchMap } from "rxjs";
import type { Post, PostFormSchema } from "../types";

/**
 * PostsApiService - Serviço de API para gerenciar Posts
 * Implementa CRUD completo usando HTTPService com DI
 */
@Injectable()
export class PostsApiService {
  @Inject(HTTPService) private httpService!: HTTPService;

  // Signals para controlar os fluxos de requisição
  private createPost$ = signal<PostFormSchema>();
  private updatePost$ = signal<{ id: number; data: PostFormSchema }>();
  private deletePost$ = signal<number>();

  // Fluxos reativos que são ativados quando os signals mudam
  private createFlow$ = signal(
    this.createPost$.pipe(
      exhaustMap((data) => {
        console.log("Criando post...", data);
        return this.httpService.post<Post>("/posts", { ...data, userId: 1 });
      })
    )
  );

  private updateFlow$ = signal(
    this.updatePost$.pipe(
      switchMap(({ id, data }) =>
        this.httpService.put<Post>(`/posts/${id}`, { ...data, userId: 1 })
      )
    )
  );

  private deleteFlow$ = signal(
    this.deletePost$.pipe(
      switchMap((id) => this.httpService.delete<void>(`/posts/${id}`))
    )
  );

  /**
   * Busca todos os posts
   */
  getPosts() {
    console.log("Buscando posts...");
    return this.httpService.get<Post[]>("/posts?_limit=10&order=desc");
  }

  /**
   * Busca um post por ID
   */
  getPost(id: number) {
    return this.httpService.get<Post>(`/posts/${id}`);
  }

  /**
   * Cria um novo post
   */
  createPost(data: PostFormSchema) {
    this.createPost$.set(data);
    return this.createFlow$;
  }

  /**
   * Atualiza um post existente
   */
  updatePost(id: number, data: PostFormSchema) {
    this.updatePost$.set({ id, data });
    return this.updateFlow$;
  }

  /**
   * Deleta um post
   */
  deletePost(id: number) {
    this.deletePost$.set(id);
    return this.deleteFlow$;
  }
}
