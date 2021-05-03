const Koa = require("koa");
const Router = require("koa-router");
const serve = require("koa-static");
const path = require("path");
const fs = require("fs");
const { createBundleRenderer } = require("vue-server-renderer");
const server = new Koa();
const router = new Router();

const serverBundle = require(path.resolve(
  __dirname,
  "../dist/vue-ssr-server-bundle.json"
));
const clientManifest = require(path.resolve(
  __dirname,
  "../dist/vue-ssr-client-manifest.json"
));
const template = fs.readFileSync(
  path.resolve(__dirname, "../dist/index.ssr.html"),
  "utf-8"
);

const renderer = createBundleRenderer(serverBundle, {
  runInNewContext: false,
  template: template,
  clientManifest: clientManifest,
});

// 后端Server
server.use(serve(path.resolve(__dirname, "../dist")));

router.get("*", (ctx, next) => {
  console.log("query Url:", ctx.url);

  let context = {
    url: ctx.url,
  };

  const ssrStream = renderer.renderToStream(context);
  ctx.status = 200;
  ctx.type = "html";
  ctx.body = ssrStream;
});

server.use(router.routes()).use(router.allowedMethods());

server.listen(3000, () => {
  console.log("服务器端渲染地址： http://localhost:3000");
});
