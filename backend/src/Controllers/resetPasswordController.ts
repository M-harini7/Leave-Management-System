import { Request, ResponseToolkit } from "@hapi/hapi";
import { ResetPasswordService } from "../Services/resetPasswordService";

export const resetPasswordByEmail = async (request: Request, h: ResponseToolkit) => {
  const { email, newPassword } = request.payload as { email: string; newPassword: string };

  const result = await ResetPasswordService.resetByEmail(email, newPassword);

  if (!result.success) {
    return h.response(result).code(404);
  }

  return h.response(result).code(200);
};
