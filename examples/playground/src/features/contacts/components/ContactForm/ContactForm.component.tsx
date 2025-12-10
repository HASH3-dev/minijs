import { Component, Inject, signal } from "@mini/core";
import type { ContactForm as ContactFormData } from "../../types";
import { ContactRepository } from "../../../../repositories/contact";

interface ContactFormProps {
  onSubmitSuccess?: () => void;
}

export class ContactFormComponent extends Component<ContactFormProps> {
  private form = signal<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  private submitted = signal(false);
  private loading = signal(false);

  @Inject(ContactRepository)
  private repository!: ContactRepository;

  handleInputChange(field: keyof ContactFormData, value: string) {
    this.form.set((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async handleSubmit(e: Event) {
    e.preventDefault();
    this.loading.set(true);

    try {
      const result = await this.repository.submitContact(this.form.value);

      if (result.success) {
        this.submitted.set(true);
        this.props.onSubmitSuccess?.();

        // Reset form após 3 segundos
        setTimeout(() => {
          this.form.set({
            name: "",
            email: "",
            phone: "",
            message: "",
          });
          this.submitted.set(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error submitting contact:", error);
    } finally {
      this.loading.set(false);
    }
  }

  render() {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Envie uma Mensagem
        </h2>

        {this.submitted.map((submitted) =>
          submitted ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
              <p className="font-semibold">✓ Mensagem enviada com sucesso!</p>
              <p className="text-sm">Entraremos em contato em breve.</p>
            </div>
          ) : null
        )}

        <form onSubmit={(e) => this.handleSubmit(e)}>
          {/* Name Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={this.form.map((f) => f.name)}
              onInput={(e: any) =>
                this.handleInputChange("name", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="João Silva"
            />
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={this.form.map((f) => f.email)}
              onInput={(e: any) =>
                this.handleInputChange("email", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="joao@exemplo.com"
            />
          </div>

          {/* Phone Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone
            </label>
            <input
              type="tel"
              value={this.form.map((f) => f.phone)}
              onInput={(e: any) =>
                this.handleInputChange("phone", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="(11) 98765-4321"
            />
          </div>

          {/* Message Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem
            </label>
            <textarea
              required
              rows={4}
              value={this.form.map((f) => f.message)}
              onInput={(e: any) =>
                this.handleInputChange("message", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              placeholder="Como podemos ajudá-lo?"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={this.loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
              this.loading.value
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {this.loading.map((loading) =>
              loading ? "Enviando..." : "Enviar Mensagem"
            )}
          </button>
        </form>
      </div>
    );
  }
}
