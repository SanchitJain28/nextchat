import Ably from "ably";

// ensure Vercel doesn't cache the result of this route,
// as otherwise the token request data will eventually become outdated
// and we won't be able to authenticate on the client side
export const revalidate = 0;

export async function GET() {
  const client = new Ably.Rest("crQyOw.vLOEMw:jC2cZ-1cQhGeA41YTlCrQZc64dhXx79HOcPS1Lmf5zs");
  const tokenRequestData = await client.auth.createTokenRequest({
    clientId: "ably-nextjs-demo",
  });
  return Response.json(tokenRequestData);
}