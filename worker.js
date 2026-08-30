import { ImageResponse } from 'workers-og';

async function verifyTurnstile(token, secret, ip) {
  if (!token) return false;
  const formData = new FormData();
  formData.append('secret', secret);
  formData.append('response', token);
  if (ip) formData.append('remoteip', ip);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  return data.success;
}

async function fetchLatestPost() {
  const res = await fetch('https://diazkaa.blogspot.com/feeds/posts/default?alt=rss&max-results=1');
  const xml = await res.text();

  const itemMatch = xml.match(/<item>([\s\S]*?)<\/item>/);
  if (!itemMatch) return null;
  const item = itemMatch[1];

  const titleMatch = item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
  const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);

  return {
    title: titleMatch ? titleMatch[1].trim() : null,
    link: linkMatch ? linkMatch[1].trim() : null,
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const ip = request.headers.get('CF-Connecting-IP');

    if (url.pathname === "/api/views" && request.method === "POST") {
      const { token } = await request.json();
      const valid = await verifyTurnstile(token, env.TURNSTILE_SECRET, ip);
      if (!valid) {
        return new Response(JSON.stringify({ error: "Verifikasi gagal" }), { status: 403 });
      }
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
      const { id, action, token } = await request.json();
      const valid = await verifyTurnstile(token, env.TURNSTILE_SECRET, ip);
      if (!valid) {
        return new Response(JSON.stringify({ error: "Verifikasi gagal" }), { status: 403 });
      }
      let count = await env.VIEWS.get(`like:${id}`);
      count = count ? parseInt(count) : 0;
      count = action === "unlike" ? Math.max(0, count - 1) : count + 1;
      await env.VIEWS.put(`like:${id}`, String(count));
      return new Response(JSON.stringify({ likes: count }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/api/latest-post") {
      const cached = await env.VIEWS.get('latest-post');
      return new Response(cached || JSON.stringify({ title: null, link: null }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/api/refresh-latest-post") {
      const post = await fetchLatestPost();
      if (post && post.title && post.link) {
        await env.VIEWS.put('latest-post', JSON.stringify(post));
        return new Response(JSON.stringify({ ok: true, post }), {
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ ok: false }), { status: 500 });
    }

    return env.ASSETS.fetch(request);
  },

  async scheduled(event, env, ctx) {
    const post = await fetchLatestPost();
    if (post && post.title && post.link) {
      await env.VIEWS.put('latest-post', JSON.stringify(post));
    }
  },
};
