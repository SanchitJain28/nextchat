import prisma from "@/lib/prisma";
import { SignIn } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'

export default async function Home() {
  const users = await prisma.user.findMany();
  
  const { userId, redirectToSignIn } = await auth()
  console.log(userId)
  if (!userId) return redirectToSignIn()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center -mt-16">
      <SignIn />
      <h1 className="text-4xl font-bold mb-8 font-[family-name:var(--font-geist-sans)] text-[#333333]">
        Superblog
      </h1>
      <ol className="list-decimal list-inside font-[family-name:var(--font-geist-sans)]">
        {users.map((user) => (
          <li key={user.id} className="mb-2 text-black">
            {user.name}
          </li>
        ))}
      </ol>
    </div>
  );
}
