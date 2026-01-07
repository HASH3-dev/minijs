import { Component } from "@mini/core";
import { Link } from "@mini/router";
import type { Post } from "../../types";

interface PostCardProps {
  post: Post;
  onDelete: (id: number) => void;
}

/**
 * PostCard - Componente reutilizável para exibir um post
 */
export class PostCard extends Component<PostCardProps> {
  render() {
    const { post, onDelete } = this.props;

    return (
      <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">
            {post.title}
          </h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            #{post.id}
          </span>
        </div>
        <p className="text-gray-600 mb-4 line-clamp-3">{post.body}</p>
        <div className="flex gap-2">
          <Link
            href={`/posts/${post.id}/edit`}
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm text-center"
          >
            ✏️ Editar
          </Link>
          <button
            onClick={() => onDelete(post.id)}
            className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            🗑️ Deletar
          </button>
        </div>
      </div>
    );
  }
}
