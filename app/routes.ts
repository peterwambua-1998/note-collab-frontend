import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("note/:roomId", 'routes/note.tsx')
] satisfies RouteConfig;
