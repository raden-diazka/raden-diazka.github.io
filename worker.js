import { ImageResponse } from 'workers-og';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/views") {
      let count = await env.VIEWS.get("count");
      count = count ? parseInt(count) + 1 : 1;
      await env.VIEWS.put("count", String(count));
      return new Response(JSON.stringify({ views: count }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/api/og") {
      const title = url.searchParams.get("title") || "Raden Diazka Adhitya Budiman";
      const html = `
        <div style="display:flex;flex-direction:column;justify-content:center;align-items:center;width:1200px;height:630px;background:linear-gradient(135deg,#0f172a,#1e293b);font-family:sans-serif;">
          <h1 style="color:white;font-size:64px;text-align:center;padding:0 60px;">${title}</h1>
          <p style="color:#94a3b8;font-size:28px;margin-top:20px;">Portfolio — Network Enthusiast</p>
        </div>
      `;
      return new ImageResponse(html, { width: 1200, height: 630 });
    }

    if (url.pathname === "/api/like" && request.method === "GET") {
      const id = url.searchParams.get("id");
      const count = await env.VIEWS.get(`like:${id}`);
      return new Response(JSON.stringify({ likes: count ? parseInt(count) : 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/api/like" && request.method === "POST") {
      const { id } = await request.json();
      let count = await env.VIEWS.get(`like:${id}`);
      count = count ? parseInt(count) + 1 : 1;
      await env.VIEWS.put(`like:${id}`, String(count));
      return new Response(JSON.stringify({ likes: count }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
