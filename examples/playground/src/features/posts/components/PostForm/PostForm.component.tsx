import { Component } from "@mini/core";
import { AutoForm, FormController } from "@mini/forms";
import type { PostFormSchema } from "../../types";

interface PostFormProps {
  form: FormController<PostFormSchema>;
  onSubmit: (e: Event) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

/**
 * PostForm - Componente reutilizável de formulário de post
 */
export class PostForm extends Component<PostFormProps> {
  render() {
    const { form, onSubmit, onCancel, submitLabel = "Salvar" } = this.props;

    return (
      <div
        className="
        [&_label]:text-sm [&_label]:font-medium [&_label]:text-gray-700 [&_label]:block [&_label]:mb-2
        [&_input]:w-full [&_input]:px-4 [&_input]:py-3 [&_input]:border [&_input]:border-gray-300 [&_input]:rounded-lg [&_input]:focus:outline-none [&_input]:focus:ring-2 [&_input]:focus:ring-blue-500 [&_input]:focus:border-transparent [&_input]:transition
        [&_textarea]:w-full [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:border [&_textarea]:border-gray-300 [&_textarea]:rounded-lg [&_textarea]:focus:outline-none [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-blue-500 [&_textarea]:focus:border-transparent [&_textarea]:transition [&_textarea]:resize-none [&_textarea]:min-h-[150px]
      "
      >
        <AutoForm form={form} submit={onSubmit} submitLabel={submitLabel} />
      </div>
    );
  }
}
