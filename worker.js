export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Endpoint khusus untuk hitung views
    if (url.pathname === "/api/views") {
      let count = await env.VIEWS.get("count");
      count = count ? parseInt(count) + 1 : 1;
      await env.VIEWS.put("count", String(count));
      return new Response(JSON.stringify({ views: count }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Request lain (index.html, css, js, dll) diserahkan ke static assets seperti biasa
    return env.ASSETS.fetch(request);
  },
};
