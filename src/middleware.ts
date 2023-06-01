// import { authMiddleware } from "@clerk/nextjs";

 export default () => {};

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};