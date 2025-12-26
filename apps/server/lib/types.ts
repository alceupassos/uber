import { t } from "elysia";

export const Role = t.Union([t.Literal("user"), t.Literal("captain")]);
