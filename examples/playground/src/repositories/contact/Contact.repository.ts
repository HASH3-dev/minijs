import { Injectable } from "@mini/core";
import type { ContactForm } from "../../features/contacts/types";

@Injectable()
export class ContactRepository {
  async submitContact(
    data: ContactForm
  ): Promise<{ success: boolean; message: string }> {
    // Simular chamada de API
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Contact submitted:", data);
        resolve({
          success: true,
          message: "Mensagem enviada com sucesso!",
        });
      }, 1500);
    });
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePhone(phone: string): boolean {
    // Remove caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, "");
    // Verifica se tem entre 10 e 11 dígitos
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }
}
