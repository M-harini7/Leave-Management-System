import { Server } from "@hapi/hapi";
import { resetPasswordByEmail } from "../Controllers/resetPasswordController";

export const resetPasswordRoutes = (server: Server) => {
  server.route({
    method: "POST",
    path: "/reset-password",
    handler: resetPasswordByEmail
  });
};
